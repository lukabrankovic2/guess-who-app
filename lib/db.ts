import { createClient } from "@supabase/supabase-js";
import type { Lobby } from "./game";

const db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);

export async function loadLobby(code: string): Promise<Lobby | null> {
  const { data } = await db.from("lobbies").select("state").eq("code", code).maybeSingle();
  return (data?.state as Lobby) ?? null;
}

export async function saveLobby(l: Lobby) {
  const { error } = await db.from("lobbies").upsert({ code: l.code, state: l, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}
