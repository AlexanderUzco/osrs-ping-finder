import { COUNTRY_FLAGS, type World } from "@/lib/worlds";

interface PingControlsProps {
  worldCount: number;
  testing: boolean;
  progress: { done: number; total: number };
  bestWorld: World | undefined;
  bestPingMs: number | undefined;
  updatedAt: string;
  onTest: () => void;
}

export function PingControls({
  worldCount,
  testing,
  progress,
  bestWorld,
  bestPingMs,
  updatedAt,
  onTest,
}: PingControlsProps) {
  return (
    <section className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onTest}
          disabled={testing || worldCount === 0}
          className="px-6 py-3 rounded bg-accent text-black font-bold hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition"
        >
          {testing
            ? `Testing... ${progress.done}/${progress.total}`
            : `Test ${worldCount} world${worldCount === 1 ? "" : "s"}`}
        </button>

        {bestWorld && bestPingMs !== undefined && (
          <div className="text-sm">
            <span className="text-muted">Best:</span>{" "}
            <span className="font-bold text-good">W{bestWorld.id}</span>{" "}
            <span>
              ({bestWorld.kind}, {COUNTRY_FLAGS[bestWorld.country]} {bestWorld.country}) —{" "}
              <span className="font-mono">{bestPingMs.toFixed(0)}</span> ms
            </span>
          </div>
        )}
      </div>

      {updatedAt && (
        <p className="text-xs text-muted">
          World list updated {timeAgo(updatedAt)}.
        </p>
      )}
    </section>
  );
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return rtf.format(-minutes, "minute");

  const hours = Math.round(minutes / 60);
  if (hours < 24) return rtf.format(-hours, "hour");

  const days = Math.round(hours / 24);
  return rtf.format(-days, "day");
}
