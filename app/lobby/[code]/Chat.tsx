"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type Msg = { id: number; name: string; text: string };

export default function Chat({ code, token }: { code: string; token: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const lastId = useRef(0); // id of the newest message fetched from the server
  const box = useRef<HTMLDivElement>(null);

  // Add messages to the list, skipping ones we already have, and keep them in order
  const merge = useCallback((fresh: Msg[]) => {
    setMessages((old) =>
      [...old, ...fresh.filter((f) => !old.some((o) => o.id === f.id))]
        .sort((a, b) => a.id - b.id)
        .slice(-200)
    );
  }, []);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/lobby/${code}/chat?token=${token}&after=${lastId.current}`, { cache: "no-store" });
    if (!res.ok) return;
    const fresh: Msg[] = await res.json();
    if (fresh.length === 0) return;
    lastId.current = Math.max(lastId.current, fresh[fresh.length - 1].id);
    merge(fresh);
  }, [code, token, merge]);

  useEffect(() => {
    const first = setTimeout(refresh, 0);
    const t = setInterval(refresh, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, [refresh]);

  // Keep the newest message in view
  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight });
  }, [messages]);

  async function send() {
    const t = text.trim();
    if (!t) return;
    setText("");
    const res = await fetch(`/api/lobby/${code}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, text: t }),
    });
    if (res.ok) merge([await res.json()]); // show our own message right away
  }

  return (
    <div className="rounded-xl border p-4">
      <h2 className="mb-2 font-semibold">Chat</h2>
      <div ref={box} className="mb-2 h-48 space-y-1 overflow-y-auto text-sm">
        {messages.map((m) => (
          <p key={m.id}>
            <b>{m.name}:</b> {m.text}
          </p>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="min-w-0 flex-1 rounded-lg border bg-white px-3 py-2 text-sm text-black"
          placeholder="…"
          value={text}
          maxLength={300}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white" onClick={send}>
          Send
        </button>
      </div>
    </div>
  );
}