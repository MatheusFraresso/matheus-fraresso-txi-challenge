import PokemonTypes from "./pokemon.types";

export default interface Pokemon {
  id: number;
  name: string;
  image?: string;
  types?: PokemonTypes[];
}
