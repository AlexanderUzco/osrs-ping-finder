export type Country = "US" | "GB" | "DE" | "AU" | "BR";
export type Kind = "Free" | "Members";

export type TypeFilter = "all" | Kind;
export type CountryFilter = "all" | Country;

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

export const COUNTRIES: readonly Country[] = ["US", "GB", "DE", "AU", "BR"];

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

export interface Verdict {
  label: string;
  className: string;
}

export function verdict(ms: number): Verdict {
  if (ms < 100) return { label: ms < 50 ? "excellent" : "good", className: "text-good" };
  if (ms < 200) return { label: "playable", className: "text-warn" };
  return { label: "high", className: "text-bad" };
}
