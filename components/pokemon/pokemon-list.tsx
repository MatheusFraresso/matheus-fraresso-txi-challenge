"use client";

import Pokemon from "@/contracts/pokemon/pokemon.interface";
import Table from "../table/table";
import PokemonSearchParameters from "../../contracts/pokemon/pokemon.search-params.interface";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

interface PokemonListProps {
  pokemons: Pokemon[];
}
export default function PokemonList({ pokemons }: PokemonListProps) {
  const searchParams = useSearchParams();

  const data = useMemo(
    () =>
      pokemons.filter((pokemon) => {
        const name = searchParams.get("name")?.toLocaleUpperCase();
        const types = searchParams.get("types")?.toLocaleUpperCase();

        if (name && !pokemon.name.toLocaleUpperCase().includes(name))
          return false;
        if (types && !pokemon.types?.join(" ").includes(types)) return false;

        return true;
      }),
    [searchParams]
  );
  return (
    <Table<Pokemon, PokemonSearchParameters>
      data={data}
      columnsDataMap={[
        { label: "Id", key: "id" },
        { label: "Name", key: "name" },
        {
          label: "Types",
          callback: (item) => (
            <ul>
              {item.types?.map((type, index) => {
                return <li key={index}>{type.name}</li>;
              })}
            </ul>
          ),
        },
      ]}
      isPaginated={false}
      filters={[
        {
          label: "Name",
          name: "name",
          placeholder: "Pokemon name",
          type: "text",
        },
        {
          label: "Type",
          name: "types",
          placeholder: "Pokemon type",
          type: "text",
        },
      ]}
    />
  );
}
