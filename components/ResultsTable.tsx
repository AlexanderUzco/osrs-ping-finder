import { COUNTRY_FLAGS, verdict, type World } from "@/lib/worlds";

export type SortKey = "id" | "kind" | "country" | "players" | "ping" | "activity";
export type SortDir = "asc" | "desc";
export interface Sort {
  key: SortKey;
  dir: SortDir;
}

interface ResultsTableProps {
  worlds: World[];
  pings: Map<number, number | null>;
  loading: boolean;
  sort: Sort;
  onSortChange: (key: SortKey) => void;
}

export function ResultsTable({
  worlds,
  pings,
  loading,
  sort,
  onSortChange,
}: ResultsTableProps) {
  return (
    <section className="rounded border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface text-muted uppercase text-xs tracking-wide">
            <tr>
              <SortableTh sortKey="id" align="left" sort={sort} onSortChange={onSortChange}>
                World
              </SortableTh>
              <SortableTh sortKey="kind" align="left" sort={sort} onSortChange={onSortChange}>
                Type
              </SortableTh>
              <SortableTh sortKey="country" align="left" sort={sort} onSortChange={onSortChange}>
                Country
              </SortableTh>
              <SortableTh sortKey="players" align="right" sort={sort} onSortChange={onSortChange}>
                Players
              </SortableTh>
              <SortableTh sortKey="ping" align="right" sort={sort} onSortChange={onSortChange}>
                Ping
              </SortableTh>
              <th className="px-3 py-2 text-left">Quality</th>
              <SortableTh sortKey="activity" align="left" sort={sort} onSortChange={onSortChange}>
                Activity
              </SortableTh>
            </tr>
          </thead>
          <tbody>
            {worlds.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-muted">
                  {loading ? "Loading worlds..." : "No worlds match the filters."}
                </td>
              </tr>
            ) : (
              worlds.map((w) => (
                <WorldRow key={w.id} world={w} ping={pings.get(w.id)} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

interface SortableThProps {
  children: React.ReactNode;
  sortKey: SortKey;
  align: "left" | "right";
  sort: Sort;
  onSortChange: (key: SortKey) => void;
}

function SortableTh({ children, sortKey, align, sort, onSortChange }: SortableThProps) {
  const active = sort.key === sortKey;
  const justify = align === "right" ? "justify-end" : "justify-start";
  return (
    <th className={`px-3 py-2 text-${align}`}>
      <button
        onClick={() => onSortChange(sortKey)}
        className={`inline-flex items-center gap-1 w-full ${justify} cursor-pointer hover:text-fg transition-colors ${
          active ? "text-fg" : ""
        }`}
      >
        {children}
        <SortIndicator active={active} dir={sort.dir} />
      </button>
    </th>
  );
}

function SortIndicator({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="opacity-30">↕</span>;
  return <span>{dir === "asc" ? "↑" : "↓"}</span>;
}

function WorldRow({ world, ping }: { world: World; ping: number | null | undefined }) {
  const v = typeof ping === "number" ? verdict(ping) : null;
  return (
    <tr className="border-t border-border hover:bg-surface-hover">
      <td className="px-3 py-2 font-mono font-bold">W{world.id}</td>
      <td className="px-3 py-2">
        <span className={world.kind === "Members" ? "text-accent" : "text-muted"}>
          {world.kind}
        </span>
      </td>
      <td className="px-3 py-2">
        {COUNTRY_FLAGS[world.country]} {world.country}
      </td>
      <td className="px-3 py-2 text-right font-mono text-muted">{world.players}</td>
      <td className="px-3 py-2 text-right font-mono">
        <PingCell ping={ping} />
      </td>
      <td className="px-3 py-2 text-xs">
        {v && <span className={v.className}>{v.label}</span>}
      </td>
      <td className="px-3 py-2 text-muted">
        {world.activity === "-" ? "" : world.activity}
      </td>
    </tr>
  );
}

function PingCell({ ping }: { ping: number | null | undefined }) {
  if (ping === undefined) return <>—</>;
  if (ping === null) return <span className="text-bad">fail</span>;
  return <>{`${ping.toFixed(0)} ms`}</>;
}
