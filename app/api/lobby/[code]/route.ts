import { randomUUID } from "crypto";
import { deleteLobby, loadLobby, saveLobby } from "@/lib/db";
import { applyAction, viewFor, MAX_PLAYERS, type Action } from "@/lib/game";

type Ctx = { params: Promise<{ code: string }> };
const err = (message: string, status = 400) => Response.json({ error: message }, { status });

// Read the lobby as seen by one player (?pid=...). Polled by the browser.
export async function GET(req: Request, { params }: Ctx) {
  const code = (await params).code.toUpperCase();
  const pid = new URL(req.url).searchParams.get("pid");
  const lobby = await loadLobby(code);
  if (!lobby) return err("Lobby not found", 404);
  if (!pid || !lobby.players.some((p) => p.id === pid)) return err("You are not in this lobby", 403);
  return Response.json(viewFor(lobby, pid));
}

// Join the lobby, or perform a game action.
export async function POST(req: Request, { params }: Ctx) {
  const code = (await params).code.toUpperCase();
  const body = (await req.json()) as Action & { pid?: string };
  const lobby = await loadLobby(code);
  if (!lobby) return err("Lobby not found", 404);

  if (body.action === "join") {
    if (lobby.status === "playing") return err("This game has already started");
    if (lobby.players.length >= MAX_PLAYERS) return err("Lobby is full");
    const name = String(body.name ?? "").trim().slice(0, 20);
    if (!name) return err("Enter a name");
    const pid = randomUUID();
    lobby.players.push({ id: pid, name, score: 0, thing: null, out: false });
    await saveLobby(lobby);
    return Response.json({ pid });
  }

  if (!body.pid) return err("Missing player", 403);
  const message = applyAction(lobby, body.pid, body);
  if (message) return err(message);
   if (lobby.players.length === 0) {
     await deleteLobby(code); // last person left, so remove the lobby
     return Response.json({ left: true });
   }
   await saveLobby(lobby);
   if (body.action === "leave") return Response.json({ left: true });
   return Response.json(viewFor(lobby, body.pid));
}
