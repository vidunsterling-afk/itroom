import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

function must(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export const ENV = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 4000),
  MONGO_URI: must("MONGO_URI"),
  JWT_ACCESS_SECRET: must("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: must("JWT_REFRESH_SECRET"),
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
};
