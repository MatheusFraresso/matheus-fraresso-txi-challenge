import Table from "@/components/table/table";
import { fetchPokemons } from "@/http/Pokemon";
import Pagination from "@/interfaces/pagination";
import Pokemon from "@/interfaces/pokemon/pokemon.interface";
import PokemonSearchParameters from "@/interfaces/pokemon/pokemon.search-params.interface";
import axios from "@/utils/Axios";
import Image from "next/image";

interface PageParams {
  params: { page: string; name: string; limit: string; types: string };
}

export default async function Home({ params }: PageParams) {
  const { page, name, limit, types } = params;

  const pokemons = await fetchPokemons();

  return (
    <div className="">
      <main className="px-10 pt-20">
        <Table<Pokemon, PokemonSearchParameters>
          data={pokemons}
          columnsDataMap={[{ label: "Name", chave: "name" }]}
          filters={[
            {
              label: "Name",
              name: "name",
              placeholder: "search your pokemnon by name",
              type: "text",
            },
          ]}
        />
      </main>
    </div>
  );
}
