"use client";

import Pokemon from "@/contracts/pokemon/pokemon.interface";
import Table from "../table/table";
import PokemonSearchParameters from "../../contracts/pokemon/pokemon.search-params.interface";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { pokemontSortParam } from "@/contracts/pokemon/pokemon.sort-params.type";

interface PokemonListProps {
  pokemons: Pokemon[];
}
export default function PokemonList({ pokemons }: PokemonListProps) {
  const searchParams = useSearchParams();

  const data = useMemo(
    () =>
      pokemons
        .filter((pokemon) => {
          const name = searchParams.get("name")?.toUpperCase();
          const types = searchParams.get("types")?.toUpperCase();

          if (name && !pokemon.name.toUpperCase().includes(name)) return false;

          if (
            types &&
            !pokemon.types?.some((type) =>
              type.name.toUpperCase().includes(types)
            )
          ) {
            return false;
          }

          return true;
        })
        .sort((a, b) => {
          const sort = searchParams.get("sort") as pokemontSortParam;

          if (sort === "id" || !sort) {
            return a.id - b.id;
          }

          if (sort === "name") {
            return a.name.localeCompare(b.name);
          }

          if (sort === "type") {
            const typesA = (a.types ?? [])
              .map((t) => t.name.toUpperCase())
              .sort()
              .join("-");

            const typesB = (b.types ?? [])
              .map((t) => t.name.toUpperCase())
              .sort()
              .join("-");

            return typesA.localeCompare(typesB);
          }

          return 0;
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
        {
          label: "Sort",
          name: "sort",
          type: "select",
          options: [
            { label: "Id", value: "id" },
            { label: "Name", value: "name" },
            { label: "Type", value: "type" },
          ],
        },
      ]}
    />
  );
}
