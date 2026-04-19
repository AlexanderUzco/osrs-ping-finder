"use client";

import { useEffect, useMemo, useState } from "react";
import { pingHost, runPool } from "@/lib/ping";
import {
  COUNTRY_FLAGS,
  COUNTRY_NAMES,
  isNormalWorld,
  verdict,
  worldHost,
  type Country,
  type Kind,
  type World,
  type WorldsFile,
} from "@/lib/worlds";

const BINANCE_PAY_ID = "241490113";
const BINANCE_PAY_URL = `https://pay.binance.com/en/send?id=${BINANCE_PAY_ID}`;

type TypeFilter = "all" | Kind;
type CountryFilter = "all" | Country;

export default function Home() {
  const [worlds, setWorlds] = useState<World[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const [pings, setPings] = useState<Map<number, number | null>>(new Map());
  const [testing, setTesting] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [countryFilter, setCountryFilter] = useState<CountryFilter>("all");
  const [normalOnly, setNormalOnly] = useState(false);
  const [search, setSearch] = useState("");

  const [donationOpen, setDonationOpen] = useState(false);

  useEffect(() => {
    fetch("/worlds.json")
      .then((r) => r.json())
      .then((data: WorldsFile) => {
        setWorlds(data.worlds);
        setUpdatedAt(data.updatedAt);
      })
      .catch(() => setWorlds([]));
  }, []);

  const filtered = useMemo(() => {
    return worlds.filter((w) => {
      if (typeFilter !== "all" && w.kind !== typeFilter) return false;
      if (countryFilter !== "all" && w.country !== countryFilter) return false;
      if (normalOnly && !isNormalWorld(w)) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay =
          `w${w.id} ${w.activity} ${COUNTRY_NAMES[w.country]}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [worlds, typeFilter, countryFilter, normalOnly, search]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const pa = pings.get(a.id);
      const pb = pings.get(b.id);
      const hasA = typeof pa === "number";
      const hasB = typeof pb === "number";
      if (hasA && hasB) return pa! - pb!;
      if (hasA) return -1;
      if (hasB) return 1;
      return a.id - b.id;
    });
    return arr;
  }, [filtered, pings]);

  async function testAll() {
    if (testing) return;
    setTesting(true);
    setPings(new Map());
    setProgress({ done: 0, total: filtered.length });

    const newPings = new Map<number, number | null>();
    await runPool(
      filtered,
      async (w) => {
        const ms = await pingHost(worldHost(w.id), 2);
        newPings.set(w.id, ms);
        setPings(new Map(newPings));
      },
      20,
      (done, total) => setProgress({ done, total }),
    );

    setTesting(false);
  }

  const countries: Country[] = ["US", "GB", "DE", "AU", "BR"];
  const testedResults = Array.from(pings.values()).filter(
    (v): v is number => typeof v === "number",
  );
  const best =
    testedResults.length > 0
      ? sorted.find((w) => {
          const p = pings.get(w.id);
          return typeof p === "number" && p === Math.min(...testedResults);
        })
      : undefined;

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-accent)]">
              OSRS Ping Finder
            </h1>
            <p className="text-xs text-[var(--color-muted)]">
              Find the world with the lowest ping from your browser.
            </p>
          </div>
          <button
            onClick={() => setDonationOpen(true)}
            className="px-4 py-2 rounded border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-black transition text-sm font-semibold"
          >
            ☕ Donate
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <section className="flex flex-wrap items-center gap-3">
          <button
            onClick={testAll}
            disabled={testing || filtered.length === 0}
            className="px-6 py-3 rounded bg-[var(--color-accent)] text-black font-bold hover:bg-[var(--color-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {testing
              ? `Testing... ${progress.done}/${progress.total}`
              : `Test ${filtered.length} world${filtered.length === 1 ? "" : "s"}`}
          </button>
          {best && (
            <div className="text-sm">
              <span className="text-[var(--color-muted)]">Best:</span>{" "}
              <span className="font-bold text-[var(--color-good)]">
                W{best.id}
              </span>{" "}
              <span>
                ({best.kind}, {COUNTRY_FLAGS[best.country]} {best.country}) —{" "}
                <span className="font-mono">
                  {pings.get(best.id)?.toFixed(0)}
                </span>{" "}
                ms
              </span>
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs uppercase tracking-wide text-[var(--color-muted)] mb-1">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
              className="w-full px-3 py-2 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text)]"
            >
              <option value="all">All</option>
              <option value="Members">Members only</option>
              <option value="Free">Free-to-Play only</option>
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-[var(--color-muted)] mb-1">
              Country
            </label>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value as CountryFilter)}
              className="w-full px-3 py-2 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text)]"
            >
              <option value="all">All</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {COUNTRY_FLAGS[c]} {COUNTRY_NAMES[c]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-[var(--color-muted)] mb-1">
              Search
            </label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="World #, activity..."
              className="w-full px-3 py-2 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-muted)]"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer text-sm select-none">
              <input
                type="checkbox"
                checked={normalOnly}
                onChange={(e) => setNormalOnly(e.target.checked)}
                className="h-4 w-4 accent-[var(--color-accent)]"
              />
              Normal worlds only (no PvP / skill total / minigames)
            </label>
          </div>
        </section>

        <section className="rounded border border-[var(--color-border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-bg-elevated)] text-[var(--color-muted)] uppercase text-xs tracking-wide">
                <tr>
                  <th className="px-3 py-2 text-left">World</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">Country</th>
                  <th className="px-3 py-2 text-right">Players</th>
                  <th className="px-3 py-2 text-right">Ping</th>
                  <th className="px-3 py-2 text-left">Quality</th>
                  <th className="px-3 py-2 text-left">Activity</th>
                </tr>
              </thead>
              <tbody>
                {sorted.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-8 text-center text-[var(--color-muted)]"
                    >
                      {worlds.length === 0
                        ? "Loading worlds..."
                        : "No worlds match the filters."}
                    </td>
                  </tr>
                )}
                {sorted.map((w) => {
                  const ms = pings.get(w.id);
                  const v = typeof ms === "number" ? verdict(ms) : null;
                  return (
                    <tr
                      key={w.id}
                      className="border-t border-[var(--color-border)] hover:bg-[var(--color-bg-row)]"
                    >
                      <td className="px-3 py-2 font-mono font-bold">W{w.id}</td>
                      <td className="px-3 py-2">
                        <span
                          className={
                            w.kind === "Members"
                              ? "text-[var(--color-accent)]"
                              : "text-[var(--color-muted)]"
                          }
                        >
                          {w.kind}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {COUNTRY_FLAGS[w.country]} {w.country}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-[var(--color-muted)]">
                        {w.players}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {ms === undefined
                          ? "—"
                          : ms === null
                            ? <span className="text-[var(--color-bad)]">fail</span>
                            : `${ms.toFixed(0)} ms`}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {v && (
                          <span style={{ color: v.color }}>{v.label}</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-[var(--color-muted)]">
                        {w.activity === "-" ? "" : w.activity}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="text-xs text-[var(--color-muted)] pt-4 pb-8 space-y-2">
          <p>
            Latency is measured via an HTTPS request to each world&apos;s{" "}
            <code>jav_config.ws</code> endpoint. It&apos;s not a raw ICMP ping —
            the absolute numbers include TLS handshake time — but the relative
            ordering between worlds matches what you&apos;d see in RuneLite.
          </p>
          <p>
            World list last refreshed:{" "}
            <span className="font-mono">
              {updatedAt ? new Date(updatedAt).toUTCString() : "—"}
            </span>{" "}
            · Source:{" "}
            <a
              href="https://oldschool.runescape.com/slu"
              className="underline hover:text-[var(--color-accent)]"
              target="_blank"
              rel="noopener noreferrer"
            >
              oldschool.runescape.com/slu
            </a>
          </p>
          <p>
            Not affiliated with Jagex. OSRS is a trademark of Jagex Limited.
          </p>
        </footer>
      </main>

      {donationOpen && (
        <div
          onClick={() => setDonationOpen(false)}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg p-6 max-w-md w-full space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--color-accent)]">
                Support this project
              </h2>
              <button
                onClick={() => setDonationOpen(false)}
                className="text-[var(--color-muted)] hover:text-[var(--color-text)]"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-[var(--color-text)]">
              If this saved you from a laggy raid, a tip keeps the servers &mdash;
              and the coffee &mdash; flowing.
            </p>
            <div className="bg-[var(--color-bg)] rounded p-4 space-y-2">
              <div className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                Binance Pay ID
              </div>
              <div className="flex items-center gap-2">
                <code className="font-mono text-xl text-[var(--color-accent)] flex-1">
                  {BINANCE_PAY_ID}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(BINANCE_PAY_ID);
                  }}
                  className="px-3 py-1 rounded bg-[var(--color-accent)] text-black text-xs font-semibold hover:bg-[var(--color-accent-hover)]"
                >
                  Copy
                </button>
              </div>
            </div>
            <a
              href={BINANCE_PAY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-4 py-3 rounded bg-[var(--color-accent)] text-black font-bold text-center hover:bg-[var(--color-accent-hover)]"
            >
              Open Binance Pay
            </a>
            <p className="text-xs text-[var(--color-muted)] text-center">
              Send any amount · any supported coin · zero fees inside Binance.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
