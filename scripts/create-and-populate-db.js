const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const Database = require("better-sqlite3");
const argv = require("minimist")(process.argv.slice(2), {
  alias: { metaDir: "m", db: "d" },
  default: {
    metaDir: "./scripts/data/images/meta",
    db: "./db/pokedex.sqlite",
  },
});

const META_DIR = path.resolve(argv.metaDir);
const DB_PATH = path.resolve(argv.db);

function ensureDirExists(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function initDb(dbPath) {
  ensureDirExists(dbPath);
  const db = new Database(dbPath);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;

    CREATE TABLE IF NOT EXISTS pokemon (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      types TEXT NOT NULL,
      meta_json TEXT,
      image_blob BLOB NOT NULL,
      image_mime TEXT NOT NULL,
      thumb_blob BLOB,
      thumb_mime TEXT,
      checksum TEXT,
      image_size INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_pokemon_id ON pokemon(id);
  `);
  return db;
}

async function detectMimeFromBuffer(buf) {
  try {
    const meta = await sharp(buf).metadata();
    if (meta && meta.format) return `image/${meta.format}`;
  } catch (err) {
    // ignore
  }
  return "application/octet-stream";
}

function readJsonSafe(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (err) {
    return null;
  }
}

async function processMetaFile(db, metaPath) {
  const meta = readJsonSafe(metaPath);
  if (!meta) {
    console.warn(`Skipping invalid JSON: ${metaPath}`);
    return { skipped: true, reason: "invalid-json", path: metaPath };
  }

  const id = meta.id;
  const name = meta.name;
  const origPath = meta.saved_original;
  const thumbPath = meta.saved_thumb;

  if (!id || !name) {
    console.warn(`Skipping meta without id/name: ${metaPath}`);
    return { skipped: true, reason: "no-id-or-name", path: metaPath };
  }

  if (!origPath || !fs.existsSync(origPath)) {
    console.warn(`Missing original image for #${id} ${name}: ${origPath}`);
    return { skipped: true, reason: "missing-original", id, name };
  }

  const imageBuf = fs.readFileSync(origPath);
  const imageMime = await detectMimeFromBuffer(imageBuf);

  let thumbBuf = null;
  let thumbMime = null;
  if (thumbPath && fs.existsSync(thumbPath)) {
    try {
      thumbBuf = fs.readFileSync(thumbPath);
      thumbMime = await detectMimeFromBuffer(thumbBuf);
    } catch (err) {
      console.warn(`Failed reading thumb for #${id} ${name}: ${err.message}`);
      thumbBuf = null;
      thumbMime = null;
    }
  }

  const checksum = meta.checksum || null;
  const types = Array.isArray(meta.types)
    ? meta.types
    : meta.types
    ? JSON.parse(meta.types)
    : [];

  const insert = db.prepare(`
    INSERT INTO pokemon (id, name, types, meta_json, image_blob, image_mime, thumb_blob, thumb_mime, checksum, image_size)
    VALUES (@id,@name,@types,@meta_json,@image_blob,@image_mime,@thumb_blob,@thumb_mime,@checksum,@image_size)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      types = excluded.types,
      meta_json = excluded.meta_json,
      image_blob = excluded.image_blob,
      image_mime = excluded.image_mime,
      thumb_blob = excluded.thumb_blob,
      thumb_mime = excluded.thumb_mime,
      checksum = excluded.checksum,
      image_size = excluded.image_size
  `);

  insert.run({
    id,
    name,
    types: JSON.stringify(types),
    meta_json: JSON.stringify(meta),
    image_blob: imageBuf,
    image_mime: imageMime,
    thumb_blob: thumbBuf || null,
    thumb_mime: thumbMime || null,
    checksum,
    image_size: imageBuf.length,
  });

  console.log(`Inserted/Updated #${id} ${name} (bytes=${imageBuf.length})`);
  return { skipped: false, id, name };
}

async function main() {
  console.log("Populate SQLite DB from downloaded image files");
  console.log("Meta dir:", META_DIR);
  console.log("DB path:", DB_PATH);

  if (!fs.existsSync(META_DIR)) {
    console.error("Meta directory does not exist:", META_DIR);
    process.exit(2);
  }

  const db = initDb(DB_PATH);

  const metaFiles = fs
    .readdirSync(META_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();
  console.log(`Found ${metaFiles.length} meta files`);

  for (const file of metaFiles) {
    const fullPath = path.join(META_DIR, file);
    try {
      // eslint-disable-next-line no-await-in-loop
      await processMetaFile(db, fullPath);
    } catch (err) {
      console.error(`Error processing ${file}:`, err.message || err);
    }
  }

  db.close();
  console.log("Done.");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
