import { createClient } from "@insforge/sdk";

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

if (!baseUrl || !anonKey) {
  throw new Error("Missing InsForge URL or Anon Key");
}

export const insforge = createClient({
  baseUrl,
  anonKey,
});
