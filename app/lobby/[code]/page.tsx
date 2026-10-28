"use client";
import Chat from "./Chat";
import Notes from "./Notes";
import Image from "next/image";
import { Suspense, useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Lobby, PublicPlayer } from "@/lib/game";

type View = Omit<Lobby, "players"> & { players: PublicPlayer[]; me: string; categories: string[] };

const subscribe = () => () => {};
function LobbyContent() { 
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
    // undefined = still on the server, null = no saved player id, string = saved id
  const stored = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(`pid:${code}`),
    () => undefined
  );
  const [joinedPid, setJoinedPid] = useState<string | null>(null);
  const pid = joinedPid ?? stored ?? null;
  const ready = stored !== undefined;
  const [view, setView] = useState<View | null>(null);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [joining, setJoining] = useState(false);


  const refresh = useCallback(async () => {
    if (!pid) return;
    const res = await fetch(`/api/lobby/${code}?token=${pid}`, { cache: "no-store" });
    const data = await res.json();
    if (res.ok) setView(data);
    else setError(data.error);
  }, [code, pid]);

  // Ask the server for the latest state every 2 seconds.
  useEffect(() => {
    const first = setTimeout(refresh, 0);
    const t = setInterval(refresh, 2000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, [refresh]);

  async function post(body: object) {
    const res = await fetch(`/api/lobby/${code}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { ok: res.ok, data: await res.json() };
  }

  async function act(body: object) {
    const { ok, data } = await post({ token: pid, ...body });
    if (ok) { setView(data); setError(""); } else setError(data.error);
  }

  async function join() {
    if (joining) return;
    setJoining(true);
    const { ok, data } = await post({ action: "join", name });
    if (!ok) {
      setJoining(false);
      return setError(data.error);
    }
    localStorage.setItem(`pid:${code}`, data.token);
    setJoinedPid(data.token);
  }

  async function leave() {
    if (!window.confirm("Leave this lobby?")) return;
    await post({ token: pid, action: "leave" });
    router.push("/");
    localStorage.removeItem(`pid:${code}`);
    localStorage.removeItem(`notes:${code}`);
  }

  const btn = "rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-40";
  const input = "rounded-lg border px-3 py-2 text-black bg-white";

  if (!ready) return null;

  if (!pid)
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 p-6">
        <h1 className="text-2xl font-bold">Join lobby {code}</h1>
        <input className={input} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        <button className={btn} disabled={!name.trim()} onClick={join}>Join</button>
        {error && <p className="text-red-500">{error}</p>}
      </main>
    );

  if (!view) return <main className="p-6">{error || "Loading…"}</main>;

  const isHost = view.hostId === view.me;
  const current = view.players.find((p) => p.id === view.turnId);
  const chosen = category || view.category || view.categories[0];
  const ranking = [...view.players].sort((a, b) => b.score - a.score);

  const picker = (label: string, action: string) => (
    <div className="flex flex-wrap items-center gap-2">
      <select className={input} value={chosen} onChange={(e) => setCategory(e.target.value)}>
        {view.categories.map((c) => <option key={c}>{c}</option>)}
      </select>
      <button className={btn} onClick={() => act({ action, category: chosen })}>{label}</button>
    </div>
  );

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="grid gap-6 md:grid-cols-[1fr_20rem]">
       <div className="space-y-6">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold">Lobby {view.code}</h1>
        <span className="text-sm opacity-70">{view.players.length}/8 players{view.category && ` · ${view.category}`}</span>
      </header>

      {view.status === "playing" && current && (
        <p className="text-lg">It&apos;s <b>{current.name}</b>&apos;s turn</p>
      )}
      {view.status === "finished" && <p className="text-lg font-semibold">Game over</p>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {view.players.map((p) => (
          <div
            key={p.id}
            className={`rounded-xl border p-8 text-center ${
              p.id === view.turnId ? "bg-amber-100 text-black ring-4 ring-amber-400" : ""
            } ${p.out ? "opacity-40" : ""}`}
          >
            <div className="font-semibold">
              {p.name}{p.id === view.hostId && " 👑"}{p.id === view.me && " (you)"}
            </div>
               {view.status !== "lobby" && (
                <div className="my-2 flex flex-col items-center gap-2">
                  {p.thing ? (
                    <>
                      {p.thing.image && (
                        <Image src={p.thing.image} alt={p.thing.name} width={96} height={96} className="h-24 w-24 rounded-lg object-contain" />
                      )}
                      <span className="text-lg">{p.thing.name}</span>
                    </>
                  ) : (
                    <span className="text-xl">❓</span>
                  )}
                </div>
              )}
            <div className="text-sm">{p.score} pts</div>
            {isHost && view.status === "playing" && !p.out && (
              <button className="mt-2 rounded bg-green-600 px-2 py-1 text-sm text-white" onClick={() => act({ action: "guessed", target: p.id })}>
                Guessed
              </button>
            )}
          </div>
        ))}
      </div>

      {view.status === "lobby" && (isHost ? picker("Start game", "start") : <p>Waiting for the host to start…</p>)}

      {view.status === "playing" && (isHost || current?.id === view.me) && (
        <button className={btn} onClick={() => act({ action: "next" })}>Next turn</button>
      )}

      {view.status === "finished" && (
        <>
          
          {isHost ? picker("New game", "newGame") : <p>Waiting for the host to start a new game…</p>}
        </>
      )}
    <button className="text-sm underline opacity-70" onClick={leave}>Leave lobby</button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
      <aside className="h-fit space-y-4">
        <div className="rounded-xl border p-4">
         <h2 className="mb-2 font-semibold">Leaderboard</h2>
         <table className="w-full text-sm">
           <tbody>
             {ranking.map((p, i) => (
               <tr key={p.id}>
                 <td className="py-1 pr-2 opacity-60">{i + 1}.</td>
                 <td className="py-1">{p.name}{p.id === view.me && " (you)"}</td>
                 <td className="py-1 text-right font-semibold">{p.score}</td>
               </tr>
             ))}
           </tbody>
         </table>
            </div>
     <Chat code={code} token={pid} />
     <Notes code={code} />
   </aside>
     </div>
   </main>
  );
}

   export default function LobbyPage() {
     return (
       <Suspense fallback={<main className="p-6">Loading…</main>}>
         <LobbyContent />
       </Suspense>
     );
   }
