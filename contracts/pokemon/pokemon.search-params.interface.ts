import { pokemontSortParam } from "./pokemon.sort-params.type";
import PokemonTypes from "./pokemon.types";

export default interface PokemonSearchParameters {
  name?: string;
  types?: string;
  sort?: pokemontSortParam;
}
