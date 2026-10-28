"use client";
import { useState } from "react";

export default function Notes({ code }: { code: string }) {
  const key = `notes:${code}`;
  const [text, setText] = useState(() => (typeof window === "undefined" ? "" : localStorage.getItem(key) ?? ""));

  return (
    <div className="rounded-xl border p-4">
      <div className="mb-1 flex items-baseline justify-between">
        <h2 className="font-semibold">My notes</h2>
        <button
          className="text-xs underline opacity-70"
          onClick={() => {
            setText("");
            localStorage.removeItem(key);
          }}
        >
          Clear
        </button>
      </div>
      <p className="mb-2 text-xs opacity-60">Only you can see this.</p>
      <textarea
        className="h-32 w-full rounded-lg border bg-white px-3 py-2 text-sm text-black"
        placeholder="..."
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          localStorage.setItem(key, e.target.value);
        }}
      />
    </div>
  );
}