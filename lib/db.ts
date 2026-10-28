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

export async function deleteLobby(code: string) {
  const { error } = await db.from("lobbies").delete().eq("code", code);
  if (error) throw new Error("delete failed: " + JSON.stringify(error));
}

export type ChatMessage = { id: number; name: string; text: string };

export async function loadMessages(code: string, after = 0): Promise<ChatMessage[]> {
  const { data, error } = await db
    .from("messages")
    .select("id, name, text")
    .eq("code", code)
    .gt("id", after)
    .order("id", { ascending: false })
    .limit(100);
  if (error) throw new Error("load chat failed: " + JSON.stringify(error));
  return (data ?? []).reverse() as ChatMessage[];
}

export async function addMessage(code: string, name: string, text: string) {
  const { error } = await db.from("messages").insert({ code, name, text });
  if (error) throw new Error("send chat failed: " + JSON.stringify(error));
}