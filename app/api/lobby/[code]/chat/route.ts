import { addMessage, loadLobby, loadMessages } from "@/lib/db";

type Ctx = { params: Promise<{ code: string }> };
const err = (message: string, status = 400) => Response.json({ error: message }, { status });

async function findPlayer(code: string, token: string | null | undefined) {
  if (!token) return null;
  const lobby = await loadLobby(code);
  return lobby?.players.find((p) => p.token === token) ?? null;
}

// Messages newer than ?after=<id>, for players in this lobby only
export async function GET(req: Request, { params }: Ctx) {
  const code = (await params).code.toUpperCase();
  const url = new URL(req.url);
  if (!(await findPlayer(code, url.searchParams.get("token")))) return err("You are not in this lobby", 403);
  const after = Number(url.searchParams.get("after")) || 0;
  return Response.json(await loadMessages(code, after));
}

// Send a message. The name comes from the lobby, not from the browser.
export async function POST(req: Request, { params }: Ctx) {
  const code = (await params).code.toUpperCase();
  const body = (await req.json()) as { token?: string; text?: string };
  const player = await findPlayer(code, body.token);
  if (!player) return err("You are not in this lobby", 403);
  const text = String(body.text ?? "").trim().slice(0, 300);
  if (!text) return err("Empty message");
  await addMessage(code, player.name, text);
  return Response.json({ ok: true });
}