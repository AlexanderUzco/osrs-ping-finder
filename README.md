# OSRS Ping Finder

A web tool that helps Old School RuneScape players find the world with the lowest ping from their browser. Deployed on Vercel.

## How it works

- The world list is pulled from `https://oldschool.runescape.com/slu` (the official Jagex world list) by a GitHub Action that runs every 6 hours and commits `public/worlds.json`. Each commit auto-triggers a Vercel redeploy, so the site always has a fresh list.
- In the browser, latency is measured with `fetch` (`mode: 'no-cors'`) against each world's `jav_config.ws` endpoint. The absolute numbers include the TLS handshake, but the relative ordering between worlds matches RuneLite's World Switcher.
- Filters: type (Members / Free), country, normal-only (hide PvP / skill total / minigames), and search.

## Local development

```bash
npm install
npm run dev              # http://localhost:3000
npm run refresh-worlds   # re-download the Jagex world list
npm run build
```

## Deployment (Vercel)

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new), import the repo.
3. Accept the defaults (Next.js framework auto-detected) and hit **Deploy**.
4. That's it — every push to `main` auto-deploys.

The GitHub Action in `.github/workflows/refresh-worlds.yml` keeps `public/worlds.json` up to date. Each commit from the action triggers a Vercel redeploy automatically.

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- TypeScript

## Support

If this helped you, tips are welcome via Binance Pay ID `241490113`.

## Credits

- World list: Jagex - `oldschool.runescape.com/slu`
- Not affiliated with Jagex. OSRS is a trademark of Jagex Limited.
