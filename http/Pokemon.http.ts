// src/http/pokemon.ts
import Pokemon from "@/contracts/pokemon/pokemon.interface";
import db from "@/_database/db";

interface RawListItem {
  name: string;
  url: string;
}
interface RawListResponse {
  results: RawListItem[];
}
interface RawTypeSlot {
  slot: number;
  type: { name: string; url: string };
}

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

    const rawPokewmon: RawDetailedPokemon = await res.json();

    if (
      typeof rawPokewmon?.id !== "number" ||
      typeof rawPokewmon?.name !== "string"
    ) {
      console.warn(`fetchDetailedPokemon: invalid payload for ${url}`);
      return null;
    }

    return {
      id: rawPokewmon.id,
      name: rawPokewmon.name,
      image: `/api/pokemon/${rawPokewmon.id}/image`,
      types: (rawPokewmon.types || []).map((t) => ({ name: t.type.name })),
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
    const listRes = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${limit}`
    );

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

      for (const requests of settled) {
        if (requests.status === "fulfilled" && requests.value)
          results.push(requests.value);
      }
    }
    return results;
  } catch (error) {
    console.error("fetchPokemons: unexpected error", error);
    return [];
  }
}

export { fetchPokemons };
