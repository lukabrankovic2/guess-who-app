import { randomUUID } from "crypto";
import { deleteLobby, loadLobby, saveLobby } from "@/lib/db";
import { applyAction, viewFor, MAX_PLAYERS, type Action } from "@/lib/game";

type Ctx = { params: Promise<{ code: string }> };
const err = (message: string, status = 400) => Response.json({ error: message }, { status });

// Read the lobby as seen by one player (?token=...). Polled by the browser.
export async function GET(req: Request, { params }: Ctx) {
  const code = (await params).code.toUpperCase();
  const token = new URL(req.url).searchParams.get("token");
  const lobby = await loadLobby(code);
  if (!lobby) return err("Lobby not found", 404);
  if (!token || !lobby.players.some((p) => p.token === token)) return err("You are not in this lobby", 403);
  return Response.json(viewFor(lobby, token));
}

// Join the lobby, or perform a game action.
export async function POST(req: Request, { params }: Ctx) {
  const code = (await params).code.toUpperCase();
  const body = (await req.json()) as Action & { token?: string };
  const lobby = await loadLobby(code);
  if (!lobby) return err("Lobby not found", 404);

  if (body.action === "join") {
    if (lobby.status === "playing") return err("This game has already started");
    if (lobby.players.length >= MAX_PLAYERS) return err("Lobby is full");
    const name = String(body.name ?? "").trim().slice(0, 20);
    if (!name) return err("Enter a name");
    const token = randomUUID();
    lobby.players.push({ id: randomUUID(), token, name, score: 0, thing: null, out: false });
    await saveLobby(lobby);
    return Response.json({ token });
  }

  if (!body.token) return err("Missing player", 403);
  const message = applyAction(lobby, body.token, body);
  if (message) return err(message);
  if (lobby.players.length === 0) {
    await deleteLobby(code); // last person left, so remove the lobby
    return Response.json({ left: true });
  }
  await saveLobby(lobby);
  if (body.action === "leave") return Response.json({ left: true });
  return Response.json(viewFor(lobby, body.token));
}