import Pagination from "@/interfaces/pagination";
import Pokemon from "@/interfaces/pokemon/pokemon.interface";
import axios from "@/utils/Axios";



async function fetchPokemons(params:) {
  try {
    const params = new URLSearchParams(pagination).toString();
    const { data } = await axios.get(
      `https://pokeapi.co/api/v2/pokemon/?limit=151`
    );
  } catch (error) {
    console.error(error);
    return { count: 0, next: "", previous: "", results: [] };
  }
}

export { fetchPokemons };
