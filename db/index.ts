import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import "dotenv/config";
import postgres from "postgres";
 
// create the connection
const connection = postgres(process.env.DATABASE_URL??"");
 
export const db = drizzle(connection, { schema });