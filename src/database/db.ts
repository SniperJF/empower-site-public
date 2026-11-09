import BetterSqlite3 from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

const dbPath = process.env.DB_URL || './data/db.sqlite';

// Create a new database if .env does not specify a database file
if (!process.env.DB_URL) {
  console.warn(`A database URL was not specified. A new database will be created at \"${dbPath}\".`);
}

// Create the SQLite database connection
export const sqlite = new BetterSqlite3(dbPath);
console.log(`Connected to the database at URL \"${dbPath}\"`);

// Initialize Drizzle ORM
const db = drizzle(sqlite);

export default db;
