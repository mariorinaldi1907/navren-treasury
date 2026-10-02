# Teammate setup — Navren

## Before you start

1. Accept the invitation to the private GitHub repository. Ask Mario for access if GitHub shows “404” or “Repository not found”.
2. Install **Node.js 22 LTS** from [nodejs.org](https://nodejs.org/en/download). It includes npm. If using nvm, the project includes `.nvmrc`: run `nvm install` then `nvm use` inside this folder.
3. Install [Git](https://git-scm.com/downloads), or [GitHub Desktop](https://desktop.github.com/) if you prefer a visual clone/pull workflow.
4. Close and reopen your terminal after installation. On Windows, use **Command Prompt** if PowerShell blocks `npm.ps1`.
5. Check `node --version` and `npm --version`. Use Node 22.x for a consistent team environment.

No Python, Docker, server backend, API key or `.env` setup is required. Internet is needed to download the source and dependencies; afterward the app and bundled fonts run locally.

## First run using Git

Open Terminal on macOS or Command Prompt on Windows. Choose the folder where you keep school projects, then run these commands one at a time:

```sh
git clone https://github.com/mariorinaldi1907/navren-treasury.git
cd navren-treasury
npm ci
npm start
```

`npm ci` downloads the dependency versions recorded in `package-lock.json`; it does not change the lockfile.

Open the **Local** URL printed by Vite, normally **http://127.0.0.1:5173/**. Leave the terminal running. Stop with **Ctrl+C**.

If authentication is requested, use Git's browser sign-in or GitHub Desktop. Do not put a token or password in a clone URL, project file or group chat.

## First run using GitHub Desktop

1. Sign into GitHub Desktop with the GitHub account invited to this repository.
2. Choose **File → Clone Repository → URL**.
3. Paste `https://github.com/mariorinaldi1907/navren-treasury.git` and choose a local folder.
4. Click **Clone**.
5. Open a terminal in that cloned folder and run `npm ci`, then `npm start`.

If you only want to try the app once, GitHub's **Code → Download ZIP** also works: extract it and run `npm ci` and `npm start` in the folder containing `package.json`. ZIP downloads cannot use `git pull`; download a fresh ZIP for each update.

## Run it again later

Open a terminal in your existing `navren-treasury` folder:

```sh
npm start
```

You do not need to reinstall dependencies every time.

## Pull the latest version

Stop the running app with **Ctrl+C**, then run:

```sh
git status
git pull --ff-only
npm ci
npm start
```

Use this when your working tree is clean. `--ff-only` refuses to invent a merge if your local branch has diverged.

If Git reports local edits, save them in a feature branch and commit them, or ask the group before replacing anything. Do not use `git reset --hard` or delete files just to make a pull succeed.

In GitHub Desktop, use **Fetch origin → Pull origin**, then run `npm ci` and `npm start` in the terminal.

## Making changes together

Start a feature branch before editing:

```sh
git switch -c your-name/short-change-description
```

Make your change and check it:

```sh
npm run verify
git status
```

Stage only the intended files, commit, push that branch and open a pull request on GitHub. Ask a teammate to review before merging into `main`. If dependencies change, include both `package.json` and `package-lock.json`.

## Presentation checklist

- Start the app before screen recording.
- Use **Company → Reset demo payments**, then **Overview**.
- Default flow: **New international payment → Compare available routes → Review selected route → Approve & send**.
- Wait around seven seconds for **Paid. Matched. Reconciled.**
- Explain the S$106 recommended route versus the S$70 route that misses tomorrow's deadline.
- Optional trade-off: **Flexible · 7 Oct + Lowest cost** recommends the scheduled transfer.
- If quotes expire after five minutes, use the quote refresh control before approving.
- Each browser has its own saved payments. Changes to demo data are not shared through GitHub.
- The fixed date in the app is intentional for repeatable presentations.

## Troubleshooting

| Problem | What to do |
| --- | --- |
| `node` or `npm` not recognized | Install Node 22, reopen your terminal and check `node --version`. |
| PowerShell blocks `npm.ps1` | Use Command Prompt, or run `npm.cmd ci` and `npm.cmd start`. No security-policy change is needed. |
| `git` not recognized | Install Git and reopen your terminal, or clone with GitHub Desktop. |
| Private repository says 404 | Accept the invite and use the correct GitHub account. |
| `package.json` not found | Run commands inside the cloned `navren-treasury` folder, not its parent. |
| Port 5173 is busy | Use the Local URL Vite prints; it selects another free port. |
| Cannot open the page | Check the terminal is still running. Use the printed local URL, not the GitHub repository URL. |
| `npm ci` fails | Confirm Node 22 and internet access. Pull the matching lockfile; share the error with the group rather than deleting the lockfile. |
| Install has cache permission errors | This project uses its own ignored `work/npm-cache` folder; make sure your clone folder is writable. |
| `git pull --ff-only` refuses | You have local work or divergent commits. Preserve the work and ask the group to review it; don't force-reset. |
| Invoice already has a payment | Choose **Company → Reset demo payments** to restart the presentation. |
| App shows another teammate's changes but old payments | Source updates do not reset browser storage. Use the demo reset button. |

## For Mario: give the group access

Because the repository is private, open repository **Settings → Collaborators → Add people** and invite each teammate by GitHub username. They need to accept the invitation before cloning. Do not make it public just to resolve a sign-in error.

Uploading the repository does not host the app on the internet. Each teammate runs their own local copy.
