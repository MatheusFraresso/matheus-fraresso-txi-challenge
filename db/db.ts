import path from "path";
import Database from "better-sqlite3";

const DB_PATH =
  process.env.DB_PATH || path.join(process.cwd(), "data", "pokedex.sqlite");

declare global {
  var __pokedex_db__: Database.Database | undefined;
}

function createDb() {
  const db = new Database(DB_PATH, { readonly: false });
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = NORMAL");
  return db;
}

const db: Database.Database = (global.__pokedex_db__ ??= createDb());
export default db;
