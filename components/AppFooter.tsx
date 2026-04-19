import { JAGEX_WORLD_LIST_URL } from "@/lib/constants";

interface AppFooterProps {
  updatedAt: string;
}

export function AppFooter({ updatedAt }: AppFooterProps) {
  return (
    <footer className="text-xs text-muted pt-4 pb-8 space-y-2">
      <p>
        Latency is measured via an HTTPS request to each world&apos;s{" "}
        <code>jav_config.ws</code> endpoint. It&apos;s not a raw ICMP ping — the
        absolute numbers include TLS handshake time — but the relative ordering
        between worlds matches what you&apos;d see in RuneLite.
      </p>
      <p>
        World list last refreshed:{" "}
        <span className="font-mono">
          {updatedAt ? new Date(updatedAt).toUTCString() : "—"}
        </span>{" "}
        · Source:{" "}
        <a
          href={JAGEX_WORLD_LIST_URL}
          className="underline hover:text-accent"
          target="_blank"
          rel="noopener noreferrer"
        >
          oldschool.runescape.com/slu
        </a>
      </p>
      <p>Not affiliated with Jagex. OSRS is a trademark of Jagex Limited.</p>
    </footer>
  );
}
