import { defineConfig } from 'drizzle-kit';
 
export default defineConfig({
  dialect: 'sqlite',
  out: './drizzle',
  schema: './src/database/schema.ts',
  dbCredentials: {
    url: process.env.DB_URL as string,
  }
});
