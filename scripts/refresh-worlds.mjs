import { writeFile } from "node:fs/promises";

const SOURCE = "https://oldschool.runescape.com/slu";
const ROW_RE =
  /slu-world-(\d+)[^<]*<\/a>\s*<\/td>\s*<td[^>]*>(\d+)\s*players<\/td>\s*<td[^>]*--(\w\w)'>[^<]+<\/td>\s*<td[^>]*--type'>(\w+)<\/td>\s*<td[^>]*>([^<]*)<\/td>/gs;

const res = await fetch(SOURCE, {
  headers: { "User-Agent": "Mozilla/5.0 (osrs-ping-finder refresh)" },
});
if (!res.ok) {
  throw new Error(`Failed to fetch world list: ${res.status} ${res.statusText}`);
}

const html = await res.text();
const worlds = [];
for (const m of html.matchAll(ROW_RE)) {
  worlds.push({
    id: Number(m[1]),
    players: Number(m[2]),
    country: m[3],
    kind: m[4],
    activity: m[5].trim() || "-",
  });
}
worlds.sort((a, b) => a.id - b.id);

if (worlds.length < 100) {
  throw new Error(`Parsed only ${worlds.length} worlds — Jagex page format may have changed.`);
}

const output = {
  updatedAt: new Date().toISOString(),
  worlds,
};

await writeFile("public/worlds.json", JSON.stringify(output, null, 2) + "\n");

console.log(`Wrote ${worlds.length} worlds to public/worlds.json`);
