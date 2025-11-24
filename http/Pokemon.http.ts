// src/http/pokemon.ts
import Pokemon from "@/contracts/pokemon/pokemon.interface";

type RawListItem = { name: string; url: string };
type RawListResponse = { results: RawListItem[] };

type RawTypeSlot = { slot: number; type: { name: string; url: string } };

type RawDetailedPokemon = {
  id: number;
  name: string;
  types?: RawTypeSlot[];
};

async function fetchDetailedPokemon(url: string): Promise<Pokemon | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`fetchDetailedPokemon: ${url} -> ${res.status}`);
      return null;
    }

    const raw: RawDetailedPokemon = await res.json();

    if (typeof raw?.id !== "number" || typeof raw?.name !== "string") {
      console.warn(`fetchDetailedPokemon: invalid payload for ${url}`);
      return null;
    }

    return {
      id: raw.id,
      name: raw.name,
      types: (raw.types || []).map((t) => ({ name: t.type.name })),
    } as Pokemon;
  } catch (err) {
    console.error(`fetchDetailedPokemon: failed to fetch ${url}`, err);
    return null;
  }
}

async function fetchPokemons({
  limit = 151,
  concurrency = 10,
}: {
  limit?: number;
  concurrency?: number;
} = {}): Promise<Pokemon[]> {
  try {
    const listUrl = `https://pokeapi.co/api/v2/pokemon?limit=${limit}`;
    const listRes = await fetch(listUrl);
    if (!listRes.ok) {
      console.error("fetchPokemons: failed to fetch list", listRes.status);
      return [];
    }

    const listJson: RawListResponse = await listRes.json();
    if (!listJson?.results || !Array.isArray(listJson.results)) return [];

    const urls = listJson.results.map((r) => r.url);

    const results: Pokemon[] = [];
    for (let i = 0; i < urls.length; i += concurrency) {
      const batch = urls.slice(i, i + concurrency);
      const settled = await Promise.allSettled(
        batch.map((u) => fetchDetailedPokemon(u))
      );

      for (const s of settled) {
        if (s.status === "fulfilled" && s.value) results.push(s.value);
      }
    }

    results.sort((a, b) => a.id - b.id);
    return results;
  } catch (error) {
    console.error("fetchPokemons: unexpected error", error);
    return [];
  }
}

export { fetchPokemons };
