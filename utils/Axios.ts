import { Axios } from "axios";
import { log } from "console";
import { appendFileSync, writeFileSync } from "fs";

const axios = new Axios({ baseURL: "https://pokeapi.co/api/v2" });

export default axios;
