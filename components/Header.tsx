import { GITHUB_URL } from "@/lib/constants";

interface HeaderProps {
  onOpenDonation: () => void;
}

export function Header({ onOpenDonation }: HeaderProps) {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-accent">OSRS Ping Finder</h1>
          <p className="text-xs text-muted">
            Find the world with the lowest ping from your browser.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View source on GitHub"
            className="h-10 w-10 flex items-center justify-center rounded border border-border text-muted hover:text-fg hover:border-muted cursor-pointer transition"
          >
            <GitHubMarkIcon className="w-5 h-5" />
          </a>
          <button
            onClick={onOpenDonation}
            className="h-10 px-4 flex items-center rounded border border-accent text-accent hover:bg-accent hover:text-black cursor-pointer transition text-sm font-semibold"
          >
            Donate
          </button>
        </div>
      </div>
    </header>
  );
}

function GitHubMarkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.1-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.58.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.4-5.26 5.69.41.35.77 1.05.77 2.12 0 1.53-.01 2.77-.01 3.14 0 .3.21.66.79.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}
