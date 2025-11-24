import { NextRequest, NextResponse } from "next/server";
import { cache } from "react";
import db from "@/_database/db";

interface RawImage {
  id: number;
  image_blob: Buffer | null | undefined;
  image_mime: string | null | undefined;
}

export const getPokemonImage = cache((id: number): RawImage | null => {
  const row = db
    .prepare("SELECT id, image_blob, image_mime FROM pokemon WHERE id = ?")
    .get(id) as RawImage | undefined;
  if (!row) return null;
  return row;
});

export async function GET(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const rawParams = context.params;
  const params =
    rawParams && typeof (rawParams as any).then === "function"
      ? await (rawParams as Promise<{ id: string }>)
      : (rawParams as { id: string });

  const id = Number(params?.id);
  if (!Number.isFinite(id)) {
    return new NextResponse("invalid id", { status: 400 });
  }

  const imageRow = getPokemonImage(id);
  if (!imageRow || !imageRow.image_blob) {
    return new NextResponse(null, { status: 404 });
  }

  const buffer: Buffer =
    imageRow.image_blob instanceof Buffer
      ? imageRow.image_blob
      : Buffer.from(imageRow.image_blob as any);

  const mime: string = imageRow.image_mime ?? "application/octet-stream";
  const etag = `IdPokemon:${id}`;

  const headers = new Headers();
  headers.set("Content-Type", mime);
  headers.set(
    "Cache-Control",
    "public, max-age=86400, stale-while-revalidate=3600"
  );
  headers.set("ETag", etag);

  const ifNoneMatch = request.headers.get("if-none-match");
  if (ifNoneMatch && ifNoneMatch === etag) {
    return new NextResponse(null, { status: 304, headers });
  }

  const uint8 = new Uint8Array(buffer);
  return new NextResponse(uint8, { status: 200, headers });
}
