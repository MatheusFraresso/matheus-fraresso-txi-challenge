const axios = require("axios");
const pLimit = require("p-limit").default;
const sharp = require("sharp");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const FileType = require("file-type");
const argv = require("minimist")(process.argv.slice(2), {
  alias: { out: "o", concurrency: "c", start: "s", end: "e" },
  default: { out: "./scripts/data/images", concurrency: 4, start: 1, end: 151 },
});

const OUT_DIR = path.resolve(argv.out);
const ORIGINAL_DIR = path.join(OUT_DIR, "original");
const THUMB_DIR = path.join(OUT_DIR, "thumbs");
const META_DIR = path.join(OUT_DIR, "meta");

const CONCURRENCY = Number(argv.concurrency) || 4;
const START_ID = Number(argv.start) || 1;
const END_ID = Number(argv.end) || 151;

const MAX_RETRIES = 6;
const BASE_MS = 500;
const JITTER_MS = 250;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function jitter(ms) {
  return Math.floor(Math.random() * ms);
}

function parseRetryAfter(v) {
  if (!v) return null;
  const num = Number(v);
  if (!Number.isNaN(num)) return num * 1000;
  const d = new Date(v);
  if (!Number.isNaN(d.getTime())) {
    const wait = d.getTime() - Date.now();
    return wait > 0 ? wait : 0;
  }
  return null;
}

const axiosInstance = axios.create({
  timeout: 20000,
  headers: {
    "User-Agent":
      "pokedex-downloader/1.0 (+https://your-repo-or-email.example)",
    Accept: "image/*,application/json",
  },
  responseType: "arraybuffer",
  validateStatus: (status) => (status >= 200 && status < 300) || status === 429,
});

async function fetchBufferWithBackoff(url) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await axiosInstance.get(url, { responseType: "arraybuffer" });

      if (res.status === 200) {
        return Buffer.from(res.data);
      }

      if (res.status === 429) {
        const retryAfter = parseRetryAfter(res.headers["retry-after"]);
        if (retryAfter != null) {
          console.warn(
            `429 + Retry-After=${retryAfter}ms for ${url}; waiting...`
          );
          await sleep(retryAfter);
        } else {
          const backoff = BASE_MS * Math.pow(2, attempt) + jitter(JITTER_MS);
          console.warn(
            `429 for ${url}. Backing off ${backoff}ms (attempt ${attempt})`
          );
          await sleep(backoff);
        }
        // then retry
      } else {
        throw new Error(`Unexpected status ${res.status} for ${url}`);
      }
    } catch (err) {
      const isLast = attempt === MAX_RETRIES;
      if (isLast) throw err;
      const backoff = BASE_MS * Math.pow(2, attempt) + jitter(JITTER_MS * 2);
      console.warn(
        `Network error for ${url}: ${
          err?.message || err
        }. Retrying in ${backoff}ms`
      );
      await sleep(backoff);
    }
  }
  throw new Error(`Failed fetching ${url} after ${MAX_RETRIES} retries`);
}

function sha256(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

async function downloadPokemonById(id) {
  // build pokeapi detail url
  const detailUrl = `https://pokeapi.co/api/v2/pokemon/${id}/`;
  // fetch details, get official-artwork (fall back to others)
  const detailsRes = await axios.get(detailUrl, { timeout: 20000 });
  const poke = detailsRes.data;
  const name = poke.name;
  const candidates = [
    poke.sprites?.other?.["official-artwork"]?.front_default,
    poke.sprites?.other?.["dream_world"]?.front_default,
    poke.sprites?.other?.home?.front_default,
    poke.sprites?.front_default,
  ].filter(Boolean);

  if (!candidates.length) {
    throw new Error(`No image candidates for #${id} ${name}`);
  }

  let lastErr = null;
  for (const url of candidates) {
    try {
      const buf = await fetchBufferWithBackoff(url);
      const ft = await FileType.fileTypeFromBuffer(buf);
      const mime = ft?.mime || "application/octet-stream";
      const ext = ft?.ext || "bin";

      // create webp thumb
      const thumbBuf = await sharp(buf)
        .resize({ width: 200, height: 200, fit: "inside" })
        .webp({ quality: 75 })
        .toBuffer();

      // compute checksum
      const checksum = sha256(buf);

      // write original file (with extension)
      const origFilename = `${String(id).padStart(3, "0")}_${name}.${ext}`;
      const origPath = path.join(ORIGINAL_DIR, origFilename);
      fs.writeFileSync(origPath, buf);

      // write thumb file (webp)
      const thumbFilename = `${String(id).padStart(3, "0")}_${name}.webp`;
      const thumbPath = path.join(THUMB_DIR, thumbFilename);
      fs.writeFileSync(thumbPath, thumbBuf);

      // write metadata
      const meta = {
        id,
        name,
        source_url: url,
        saved_original: origPath,
        saved_thumb: thumbPath,
        image_mime: mime,
        checksum,
        bytes: buf.length,
        timestamp: new Date().toISOString(),
      };
      const metaPath = path.join(
        META_DIR,
        `${String(id).padStart(3, "0")}_${name}.json`
      );
      fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));

      console.log(
        `Saved #${id} ${name}: ${origFilename} (${buf.length} bytes), thumb ${thumbFilename}`
      );
      return meta;
    } catch (err) {
      lastErr = err;
      console.warn(
        `Failed candidate ${url} for #${id}: ${
          err?.message || err
        }. Trying fallback if any.`
      );
      await sleep(200 + jitter(200));
      continue;
    }
  }

  throw new Error(
    `All image candidates failed for #${id}: ${lastErr?.message || lastErr}`
  );
}

async function main() {
  console.log("Starting Pokemon image download (1..151 default)");

  ensureDirStructure();

  const ids = [];
  for (let i = START_ID; i <= END_ID; i++) ids.push(i);

  const limit = pLimit(CONCURRENCY);

  const tasks = ids.map((id) =>
    limit(async () => {
      try {
        const meta = await downloadPokemonById(id);
        // polite small pause
        await sleep(50 + jitter(100));
        return meta;
      } catch (err) {
        console.error(`Failed downloading #${id}: ${err?.message || err}`);
        // still continue other downloads; return error meta
        return { id, error: String(err?.message || err) };
      }
    })
  );

  const results = await Promise.all(tasks);
  const summaryPath = path.join(META_DIR, `summary_${Date.now()}.json`);
  fs.writeFileSync(
    summaryPath,
    JSON.stringify({ createdAt: new Date().toISOString(), results }, null, 2)
  );
  console.log("Download complete. Summary written to", summaryPath);
}

function ensureDirStructure() {
  ensureDir(OUT_DIR);
  ensureDir(ORIGINAL_DIR);
  ensureDir(THUMB_DIR);
  ensureDir(META_DIR);
}

ensureDirStructure();
main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
