# Navren — group project

A working cross-border payment orchestration demo for Singapore SMEs. Compare routes, approve a simulated payment, track it and reconcile its invoice.

**Start here:** [Teammate setup guide](docs/TEAM_SETUP.md) · [Presentation demo path](docs/PRODUCT.md#presentation-demo-path)

## Run on your laptop

Install **Node.js 22 LTS** (includes npm) and **Git** first. This works on Windows, macOS and Linux. No API keys, database, bank account or `.env` file is needed.

For this private repository, accept Mario's collaborator invitation and sign into GitHub before cloning.

```sh
git clone https://github.com/mariorinaldi1907/navren-treasury.git
cd navren-treasury
npm ci
npm start
```

Open **http://127.0.0.1:5173** (or the address printed in the terminal if that port is busy). Keep the terminal open. Press **Ctrl+C** to stop.

Already cloned? Get the latest version from inside the project folder:

```sh
git pull --ff-only
npm ci
npm start
```

If Git says you have local changes, do not delete them: see [updating safely](docs/TEAM_SETUP.md#pull-the-latest-version).

## Quick demo

**Overview → New international payment → Compare available routes → Review selected route → Approve & send → Reconciled.** Keep the initial supplier and S$50,000 amount. Reset from **Company → Reset demo payments** before repeating.

All payments, rates, controls and integrations are simulated. Each browser keeps its own demo data. Nothing is connected to a bank or deployed by these commands.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm start` | Start the local app |
| `npm run dev` | Same development server |
| `npm run verify` | Type-check, run financial/control tests and build |
| `npm run build` | Create production files in `dist/` |
| `npm run preview` | Preview a previously built app locally |
| `npm run format` | Format source and tests |

## Project map

- `src/main.tsx` — React interface and demo flow
- `src/model.ts` — typed mock data, quote calculations and control rules
- `src/styles.css` — responsive design
- `tests/model.test.ts` — financial and control tests
- `docs/TEAM_SETUP.md` — setup, updates, troubleshooting and collaboration
- `docs/PRODUCT.md` — presentation click path, assumptions and architecture
- `work/QA.md` — original QA and product review

The lockfile is committed for reproducible installs. Dependencies, build output, local caches and environment files are excluded from Git. Uploaded source contains only the application and its documentation, not other course files.
