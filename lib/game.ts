import { CATEGORIES, type Item } from "./categories";

export const MAX_PLAYERS = 8;

export type Player = { id: string; name: string; score: number; thing: Item | null; out: boolean };
export type Lobby = {
  code: string;
  hostId: string;
  status: "lobby" | "playing" | "finished";
  category: string | null;
  players: Player[];
  turnId: string | null;
};
export type Action = { action: string; name?: string; category?: string; target?: string };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Next player (after fromId, in seating order) who has not guessed yet.
function nextActive(l: Lobby, fromId: string | null): string | null {
  const n = l.players.length;
  const start = Math.max(0, l.players.findIndex((p) => p.id === fromId));
  for (let i = 1; i <= n; i++) {
    const p = l.players[(start + i) % n];
    if (!p.out) return p.id;
  }
  return null;
}

function startGame(l: Lobby, category?: string): string | null {
  if (!category || !Object.hasOwn(CATEGORIES, category)) return "Pick a category";
  if (l.players.length < 2) return "Need at least 2 players";
  const items = shuffle(CATEGORIES[category]);
  if (items.length < l.players.length) return "That category has too few items";
  l.players.forEach((p, i) => {
    p.thing = items[i];
    p.out = false;
  });
  l.category = category;
  l.status = "playing";
  l.turnId = l.players[0].id;
  return null;
}

// Changes the lobby in place. Returns an error message, or null if it worked.
export function applyAction(l: Lobby, pid: string, a: Action): string | null {
  if (!l.players.some((p) => p.id === pid)) return "You are not in this lobby";
  const isHost = l.hostId === pid;

  switch (a.action) {
    case "start":
      if (!isHost || l.status !== "lobby") return "Only the host can start";
      return startGame(l, a.category);

    case "newGame":
      if (!isHost || l.status !== "finished") return "Only the host can start a new game";
      return startGame(l, a.category);

    case "next":
      if (l.status !== "playing") return "Game is not running";
      if (pid !== l.turnId && !isHost) return "Not your turn";
      l.turnId = nextActive(l, l.turnId);
      return null;

    case "guessed": {
      if (!isHost || l.status !== "playing") return "Only the host can do that";
      const t = l.players.find((p) => p.id === a.target);
      if (!t || t.out) return "Invalid player";
      const active = l.players.filter((p) => !p.out).length;
      t.score += active; // guessing earlier = more points
      t.out = true;
      if (active - 1 <= 1) {
        l.status = "finished"; // second-to-last person guessed
        l.turnId = null;
      } else if (l.turnId === t.id) {
        l.turnId = nextActive(l, t.id);
      }
      return null;
    }

    case "leave": {
      const leaver = l.players.find((p) => p.id === pid)!;
      leaver.out = true; // so turn and game-end checks ignore them
      if (l.status === "playing") {
        const remaining = l.players.filter((p) => !p.out).length;
        if (remaining <= 1) {
          l.status = "finished";
          l.turnId = null;
        } else if (l.turnId === pid) {
          l.turnId = nextActive(l, pid); // pass the turn on before removing them
        }
      }
      l.players = l.players.filter((p) => p.id !== pid);
      if (l.hostId === pid && l.players.length > 0) l.hostId = l.players[0].id;
      return null;
    }
  }
  return "Unknown action";
}

// What one player is allowed to see. Their own thing is removed on the server.
export function viewFor(l: Lobby, pid: string) {
  return {
    ...l,
    me: pid,
    categories: Object.keys(CATEGORIES),
    players: l.players.map((p) => ({
      ...p,
      thing: l.status === "playing" && p.id === pid ? null : l.status === "lobby" ? null : p.thing,
    })),
  };
}
