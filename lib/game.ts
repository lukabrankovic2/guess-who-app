import { CATEGORIES, type Item } from "./categories";

export const MAX_PLAYERS = 8;

export type Player = { id: string; token: string; name: string; score: number; thing: Item | null; out: boolean };
export type PublicPlayer = Omit<Player, "token">;
export type Lobby = {
  code: string;
  hostId: string;
  status: "lobby" | "playing" | "finished";
  category: string | null;
  players: Player[];
  turnId: string | null;
  started?: boolean; // true once the first "Next turn" (or a guess) has happened this round
  dealt?: string[]; // names of the things dealt this round
  avoid?: string[]; // names of the things from the previous round
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

function deal(category: string, count: number, avoid: string[], skipIfPossible: string[] = []): Item[] {
  const all = CATEGORIES[category];
  const tiers = [
    all.filter((i) => !avoid.includes(i.name) && !skipIfPossible.includes(i.name)),
    all.filter((i) => !avoid.includes(i.name) && skipIfPossible.includes(i.name)),
    all.filter((i) => avoid.includes(i.name)),
  ];
  return tiers.flatMap((t) => shuffle(t)).slice(0, count);
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
  const avoid = l.dealt ?? []; // the round that just ended
  const items = deal(category, l.players.length, avoid);
  if (items.length < l.players.length) return "That category has too few items";
  l.players.forEach((p, i) => {
    p.thing = items[i];
    p.out = false;
  });
  l.avoid = avoid;
  l.dealt = items.map((i) => i.name);
  l.started = false;
  l.category = category;
  l.status = "playing";
  l.turnId = l.players[0].id;
  return null;
}

   // Take a player out of the lobby, keeping turns, the host role and the end-of-game rule consistent.
   function removePlayer(l: Lobby, id: string) {
     const p = l.players.find((x) => x.id === id);
     if (!p) return;
     p.out = true; // so the turn and game-end checks ignore them
     if (l.status === "playing") {
       const remaining = l.players.filter((x) => !x.out).length;
       if (remaining <= 1) {
         l.status = "finished";
         l.turnId = null;
       } else if (l.turnId === id) {
         l.turnId = nextActive(l, id); // pass the turn on before removing them
       }
     }
     l.players = l.players.filter((x) => x.id !== id);
     if (l.hostId === id && l.players.length > 0) l.hostId = l.players[0].id;
   }

// Changes the lobby in place. Returns an error message, or null if it worked.
   export function applyAction(l: Lobby, token: string, a: Action): string | null {
     const me = l.players.find((p) => p.token === token);
     if (!me) return "You are not in this lobby";
     const pid = me.id; // public id of the player doing the action
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
      l.started = true;
      return null;

    case "reshuffle": {
      if (!isHost || l.status !== "playing") return "Only the host can do that";
      if (l.started) return "The round has already started";
      if (!l.category || !Object.hasOwn(CATEGORIES, l.category)) return "Unknown category";
      const items = deal(l.category, l.players.length, l.avoid ?? [], l.dealt ?? []);
      if (items.length < l.players.length) return "That category has too few items";
      l.players.forEach((p, i) => {
        p.thing = items[i];
      });
      l.dealt = items.map((i) => i.name);
      return null;
    }

    case "guessed": {
      if (!isHost || l.status !== "playing") return "Only the host can do that";
      const t = l.players.find((p) => p.id === a.target);
      if (!t || t.out) return "Invalid player";
      const active = l.players.filter((p) => !p.out).length;
      t.score += active; // guessing earlier = more points
      t.out = true;
      l.started = true;
      if (active - 1 <= 1) {
        l.status = "finished"; // second-to-last person guessed
        l.turnId = null;
      } else if (l.turnId === t.id) {
        l.turnId = nextActive(l, t.id);
      }
      return null;
    }

    case "leave":
      removePlayer(l, pid);
      return null;

    case "kick": {
      if (!isHost) return "Only the host can remove players";
      const target = a.target ?? "";
      if (target === pid) return "Use Leave lobby to leave yourself";
      if (!l.players.some((p) => p.id === target)) return "Invalid player";
      removePlayer(l, target);
      return null;
      }
  }
  return "Unknown action";
}

// What one player is allowed to see. Their own thing is removed on the server.
   export function viewFor(l: Lobby, token: string) {
     const me = l.players.find((p) => p.token === token);
     return {
       code: l.code,
       hostId: l.hostId,
       status: l.status,
       category: l.category,
       turnId: l.turnId,
       started: !!l.started,
       me: me?.id ?? "",
       categories: Object.keys(CATEGORIES),
       players: l.players.map((p) => ({
         id: p.id,
         name: p.name,
         score: p.score,
         out: p.out,
         thing: l.status === "lobby" ? null : l.status === "playing" && p.id === me?.id && !p.out ? null : p.thing,
       })),
     };
   }
