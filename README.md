# Wallet Tracker - Robinhood Chain

Track wallet transactions on Robinhood Chain with a Next.js dashboard.

## Features

- **Manual address management** - Add/remove addresses via UI
- **Transaction history** - Fetch from Blockscout API
- **Data persistence** - Store addresses & transactions in GitHub JSON files
- **No real-time polling** - Fetch on demand (manual trigger)
- **Deploy to Vercel** - Serverless, free tier friendly

## Setup

### 1. Clone & Install

```bash
cd wallet-tracker
npm install
```

### 2. Create GitHub Repository

Create a new GitHub repo (can be private) to store:
- `addresses.json` - Your tracked addresses
- `transactions.json` - Fetched transaction data

### 3. GitHub Personal Access Token

Create a PAT with `repo` scope:
- GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens
- Repository access: Select your repo
- Permissions: Contents (Read & Write)

### 4. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repo_name
GITHUB_FILE_PATH=addresses.json
GITHUB_BRANCH=main
BLOCKSCOUT_BASE=https://robinhoodchain.blockscout.com/api/v2
```

### 5. Run Locally

```bash
npm run dev
```

Open http://localhost:3000

### 6. Deploy to Vercel

1. Push to GitHub
2. Import in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Usage

1. **Add addresses** - Click "Add Address" in sidebar, paste address + optional label/tags
2. **Fetch transactions** - Click "Fetch All" to get history for all addresses, or "Fetch One" for single address
3. **View history** - Select wallet from dropdown, browse sortable/filterable transaction table
4. **Data stored in GitHub** - Check your repo for `addresses.json` and `transactions.json`

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Browser   │────▶│  Next.js     │────▶│  GitHub     │
│  (Dashboard)│     │  (Vercel)    │     │  (JSON)     │
└─────────────┘     └──────┬───────┘     └─────────────┘
                           │
                    ┌──────▼───────┐
                    │  Blockscout  │
                    │  API (RH)    │
                    └──────────────┘
```

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/addresses` | GET | List all tracked addresses |
| `/api/addresses` | POST | Add new address |
| `/api/addresses` | DELETE | Remove address |
| `/api/addresses` | PUT | Update address (label, tags, lastFetchedAt) |
| `/api/fetch` | POST | Trigger transaction fetch (body: `{address?, fromBlock?}`) |
| `/api/transactions` | GET | Get transactions (`?address=0x...`) |

## Limitations

- **Blockscout rate limit** - ~5 req/s, large fetches take minutes
- **No archive node** - Can't fetch from block 0 via RPC, Blockscout handles this
- **GitHub API rate limit** - 5000 req/hr (plenty for this use case)
- **Vercel function timeout** - 10s (fetch runs async, may need cron for large sets)

## Future Improvements

- [ ] Incremental fetch (from last block)
- [ ] PnL calculation
- [ ] Flow visualization (wallet → main wallet)
- [ ] Export CSV
- [ ] Webhook for auto-fetch
- [ ] Multi-chain support
# Force redeploy
