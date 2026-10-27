"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  async function create() {
    const res = await fetch("/api/lobby", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    localStorage.setItem(`pid:${data.code}`, data.pid);
    router.push(`/lobby/${data.code}`);
  }

  const input = "w-full rounded-lg border px-3 py-2 text-black bg-white";
  const btn = "rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-40";

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 p-6">
      <h1 className="text-3xl font-bold">Heads up</h1>
      <input className={input} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
      <button className={btn} disabled={!name.trim()} onClick={create}>Create private lobby</button>
      <hr />
      <input
        className={input}
        placeholder="Lobby code"
        value={code}
        maxLength={4}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
      />
      <button className={btn} disabled={code.length !== 4} onClick={() => router.push(`/lobby/${code}`)}>
        Join with code
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </main>
  );
}
