export type Country = "US" | "GB" | "DE" | "AU" | "BR";
export type Kind = "Free" | "Members";

export interface World {
  id: number;
  players: number;
  country: Country;
  kind: Kind;
  activity: string;
}

export interface WorldsFile {
  updatedAt: string;
  worlds: World[];
}

export const COUNTRY_NAMES: Record<Country, string> = {
  US: "United States",
  GB: "United Kingdom",
  DE: "Germany",
  AU: "Australia",
  BR: "Brazil",
};

export const COUNTRY_FLAGS: Record<Country, string> = {
  US: "🇺🇸",
  GB: "🇬🇧",
  DE: "🇩🇪",
  AU: "🇦🇺",
  BR: "🇧🇷",
};

export function worldHost(id: number): string {
  return `oldschool${id - 300}.runescape.com`;
}

export function isNormalWorld(w: World): boolean {
  return w.activity === "-" || w.activity === "";
}

export function verdict(ms: number): { label: string; color: string } {
  if (ms < 50) return { label: "excellent", color: "var(--color-good)" };
  if (ms < 100) return { label: "good", color: "var(--color-good)" };
  if (ms < 200) return { label: "playable", color: "var(--color-warn)" };
  return { label: "high", color: "var(--color-bad)" };
}
