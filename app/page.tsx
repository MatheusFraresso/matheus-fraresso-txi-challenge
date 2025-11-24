"use server";

import PokemonList from "@/components/pokemon/pokemon-list";
import { fetchPokemons } from "@/http/Pokemon.http";

export default async function Home() {
  const pokemons = await fetchPokemons();

  return (
    <main className="px-10 pt-20 ">
      <PokemonList pokemons={pokemons} />
    </main>
  );
}
