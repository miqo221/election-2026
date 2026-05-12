"use client";

import { useEffect, useState } from "react";

const PARTY_COUNT = 19;

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [votes, setVotes] = useState<number[]>(Array(PARTY_COUNT).fill(0));
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    if (!authed) return;
    fetch("/api/votes")
      .then((r) => r.json())
      .then((d) => { if (d.votes) setVotes(d.votes); });
  }, [authed]);

  const handleLogin = () => {
    if (password.trim()) {
      setAuthed(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleChange = (index: number, value: string) => {
    const updated = [...votes];
    updated[index] = parseFloat(value) || 0;
    setVotes(updated);
  };

  const handleSave = async () => {
    setStatus("saving");
    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, votes }),
      });
      if (res.ok) {
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2000);
      } else {
        const err = await res.json();
        if (err.error === "Unauthorized") {
          setAuthed(false);
          setAuthError(true);
        }
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const handleReset = () => setVotes(Array(PARTY_COUNT).fill(0));

  if (!authed) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-mono">
        <div className="w-full max-w-sm p-8 border border-gray-200 rounded-2xl bg-white shadow-2xl">
          <h1 className="text-black text-2xl font-bold mb-1">Admin Access</h1>
          <p className="text-gray-500 text-sm mb-6">Election Results Dashboard</p>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full bg-white border border-gray-300 text-black rounded-lg px-4 py-3 text-sm outline-none focus:border-[#e0003a] transition-colors"
          />
          {authError && (
            <p className="text-[#e0003a] text-xs mt-2">Incorrect password</p>
          )}
          <button
            onClick={handleLogin}
            className="w-full mt-4 bg-[#e0003a] hover:bg-[#b8002e] text-white font-bold py-3 rounded-lg transition-colors"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black font-mono p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-black">Election Results</h1>
            <p className="text-gray-500 text-sm mt-1">Enter raw vote counts — percentages are calculated automatically</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#e0003a] hover:text-[#e0003a] transition-colors"
            >
              Reset All
            </button>
            <button
              onClick={handleSave}
              disabled={status === "saving"}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                status === "saved"
                  ? "bg-green-600 text-white"
                  : status === "error"
                  ? "bg-red-700 text-white"
                  : "bg-[#e0003a] hover:bg-[#b8002e] text-white"
              }`}
            >
              {status === "saving" ? "Saving..." : status === "saved" ? "✓ Saved!" : status === "error" ? "Error!" : "Save & Publish"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {votes.map((val, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={`/logos/${i + 1}.svg`}
                    alt={`Party ${i + 1}`}
                    className="w-8 h-8 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <span className="text-gray-500 text-xs">Party {i + 1}</span>
                </div>
                <span className="text-[#e0003a] text-xs font-bold">
                  {votes.reduce((s, v) => s + v, 0) > 0
                    ? ((val / votes.reduce((s, v) => s + v, 0)) * 100).toFixed(1)
                    : "0.0"}%
                </span>
              </div>
              <input
                type="number"
                min="0"
                value={val}
                onChange={(e) => handleChange(i, e.target.value)}
                className="w-full bg-white border border-gray-300 focus:border-[#e0003a] text-black rounded-lg px-3 py-2 text-sm outline-none transition-colors"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 border border-gray-200 rounded-xl bg-white flex justify-between items-center">
          <span className="text-gray-500 text-sm">Total Votes</span>
          <span className="text-black font-bold text-lg">
            {votes.reduce((s, v) => s + v, 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}