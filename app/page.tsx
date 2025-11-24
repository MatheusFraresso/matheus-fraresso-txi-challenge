"use server";

import PokemonList from "@/app/components/pokemon/pokemon-list";
import { fetchPokemons } from "@/http/Pokemon.http";
import { Suspense } from "react";

export default async function Home() {
  const pokemons = await fetchPokemons();

  return (
    <main className="px-10 pt-20 ">
      <Suspense fallback={<h1>loading...</h1>}>
        <PokemonList pokemons={pokemons} />
      </Suspense>
    </main>
  );
}
