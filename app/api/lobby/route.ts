import { randomUUID } from "crypto";
import { loadLobby, saveLobby } from "@/lib/db";

const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const makeCode = () => Array.from({ length: 4 }, () => LETTERS[Math.floor(Math.random() * LETTERS.length)]).join("");

// Create a lobby. The creator becomes the host.
export async function POST(req: Request) {
  const { name } = await req.json();
  const clean = String(name ?? "").trim().slice(0, 20);
  if (!clean) return Response.json({ error: "Enter a name" }, { status: 400 });

  let code = makeCode();
  while (await loadLobby(code)) code = makeCode();

  const pid = randomUUID();
  const token = randomUUID();
  await saveLobby({
    code,
    hostId: pid,
    status: "lobby",
    category: null,
    players: [{ id: pid, token, name: clean, score: 0, thing: null, out: false }],
    turnId: null,
  });
  return Response.json({ code, token });
}