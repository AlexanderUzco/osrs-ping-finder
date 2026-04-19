"use client";

import { useEffect, useMemo, useState } from "react";

import { AppFooter } from "@/components/AppFooter";
import { DonationModal } from "@/components/DonationModal";
import { FilterBar, type FilterState } from "@/components/FilterBar";
import { Header } from "@/components/Header";
import { PingControls } from "@/components/PingControls";
import {
  ResultsTable,
  type Sort,
  type SortKey,
} from "@/components/ResultsTable";
import { PING_CONCURRENCY, PING_SAMPLES_PER_WORLD } from "@/lib/constants";
import { pingHost, runPool } from "@/lib/ping";
import {
  COUNTRY_NAMES,
  isNormalWorld,
  worldHost,
  type World,
  type WorldsFile,
} from "@/lib/worlds";

const INITIAL_FILTERS: FilterState = {
  type: "all",
  country: "all",
  normalOnly: false,
  search: "",
};

const INITIAL_SORT: Sort = { key: "ping", dir: "asc" };

type PingMap = Map<number, number | null>;

export default function Home() {
  const [worlds, setWorlds] = useState<World[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [sort, setSort] = useState<Sort>(INITIAL_SORT);

  const [pings, setPings] = useState<PingMap>(new Map());
  const [testing, setTesting] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

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

  const visible = useMemo(
    () => filterAndSort(worlds, filters, sort, pings),
    [worlds, filters, sort, pings],
  );

  const { bestWorld, bestPingMs } = useMemo(() => findBest(visible, pings), [visible, pings]);

  const updateFilters = (patch: Partial<FilterState>) =>
    setFilters((prev) => ({ ...prev, ...patch }));

  const toggleSort = (key: SortKey) =>
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );

  async function testAll() {
    if (testing) return;
    setTesting(true);
    setPings(new Map());
    setProgress({ done: 0, total: visible.length });

    await runPool(
      visible,
      async (w) => {
        const ms = await pingHost(worldHost(w.id), PING_SAMPLES_PER_WORLD);
        setPings((prev) => new Map(prev).set(w.id, ms));
      },
      PING_CONCURRENCY,
      (done, total) => setProgress({ done, total }),
    );

    setTesting(false);
  }

  return (
    <div className="min-h-screen">
      <Header onOpenDonation={() => setDonationOpen(true)} />

      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <PingControls
          worldCount={visible.length}
          testing={testing}
          progress={progress}
          bestWorld={bestWorld}
          bestPingMs={bestPingMs}
          updatedAt={updatedAt}
          onTest={testAll}
        />

        <FilterBar filters={filters} onChange={updateFilters} />

        <ResultsTable
          worlds={visible}
          pings={pings}
          loading={worlds.length === 0}
          sort={sort}
          onSortChange={toggleSort}
        />

        <AppFooter updatedAt={updatedAt} />
      </main>

      <DonationModal open={donationOpen} onClose={() => setDonationOpen(false)} />
    </div>
  );
}

function filterAndSort(
  worlds: World[],
  filters: FilterState,
  sort: Sort,
  pings: PingMap,
): World[] {
  const q = filters.search.trim().toLowerCase();
  const filtered = worlds.filter((w) => {
    if (filters.type !== "all" && w.kind !== filters.type) return false;
    if (filters.country !== "all" && w.country !== filters.country) return false;
    if (filters.normalOnly && !isNormalWorld(w)) return false;
    if (q) {
      const haystack = `w${w.id} ${w.activity} ${COUNTRY_NAMES[w.country]}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  filtered.sort((a, b) => compareWorlds(a, b, sort, pings));
  return filtered;
}

function compareWorlds(a: World, b: World, sort: Sort, pings: PingMap): number {
  const sign = sort.dir === "asc" ? 1 : -1;

  switch (sort.key) {
    case "id":
      return sign * (a.id - b.id);
    case "kind":
      return sign * a.kind.localeCompare(b.kind);
    case "country":
      return sign * a.country.localeCompare(b.country);
    case "players":
      return sign * (a.players - b.players);
    case "activity":
      return sign * a.activity.localeCompare(b.activity);
    case "ping": {
      const pa = pings.get(a.id);
      const pb = pings.get(b.id);
      const aOk = typeof pa === "number";
      const bOk = typeof pb === "number";
      if (aOk && bOk) return sign * (pa - pb);
      // keep untested/failed rows at the bottom regardless of direction
      if (aOk) return -1;
      if (bOk) return 1;
      return a.id - b.id;
    }
  }
}

function findBest(
  worlds: World[],
  pings: PingMap,
): { bestWorld: World | undefined; bestPingMs: number | undefined } {
  let best: { world: World; ms: number } | undefined;
  for (const w of worlds) {
    const ms = pings.get(w.id);
    if (typeof ms === "number" && (!best || ms < best.ms)) {
      best = { world: w, ms };
    }
  }
  return { bestWorld: best?.world, bestPingMs: best?.ms };
}
