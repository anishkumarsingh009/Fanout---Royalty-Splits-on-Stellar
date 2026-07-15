# Fanout — Royalty Splits on Stellar

An on-chain revenue-splitting protocol on Soroban for creators and their
collaborators. Register a work once with a list of collaborators and their
percentage shares. From then on, anyone paying for that work sends **one
transaction** — and every collaborator receives their exact cut directly,
in the same transaction, with no intermediary ever holding the money.

> Built for Stellar Level 3 (Orange Belt) — advanced smart contracts,
> production dApp architecture, CI/CD, and real-time event streaming.

---

## Why this shape of project

Splitting a single payment across many recipients is a fundamentally
different problem from the client/freelancer or subscriber/merchant shape
of most escrow and billing demos — it's fan-out, not one-to-one. This
project also treats "who has the authority to change a split" as a real
governance question: splits are editable by the owner right up until the
first payment, at which point the Distributor contract locks them via a
cross-contract call, so collaborators aren't trusting a promise — they're
trusting a contract that mechanically can't be changed anymore once money
has started flowing.

## How it works

1. **A creator registers a work** — a title plus a list of collaborators
   and their shares in basis points (must sum to exactly 10,000 = 100%).
2. **Anyone pays for the work** by calling `distribute_payment` with an
   amount and a token. The Distributor contract reads the current split
   from the Registry contract (a cross-contract call) and sends each
   collaborator their share **directly from the payer**, all in one
   transaction — funds never sit inside the Distributor contract itself.
3. **On the first payment**, Distributor calls back into Registry to lock
   the split, preventing any further edits.
4. **Any rounding remainder** left over from integer division goes to the
   work's owner, so no dust is ever lost.

Every step emits an event, streamed live into the frontend's "Signal
Feed"; a payer sees an instant, contract-math-accurate preview of exactly
how their payment will split before they submit it. See
[ARCHITECTURE.md](./ARCHITECTURE.md) for the full diagram and event table.

## Tech stack

| Layer | Choice |
|---|---|
| Smart contracts | Rust + Soroban SDK 21 |
| Token standard | SEP-41 (Stellar Asset Contract compatible) |
| Frontend | React 18 + Vite + Tailwind CSS |
| Wallet | Freighter |
| Testing | `cargo test` (contracts), Vitest + Testing Library (frontend) |
| CI/CD | GitHub Actions |
| Hosting | Vercel |

## Project structure

```
fanout/
├── contracts/
│   ├── registry/         # work metadata, collaborator splits, lock governance
│   └── distributor/       # reads splits, fans out payments, tracks totals
├── frontend/               # React app
├── .github/workflows/      # CI/CD pipeline
├── ARCHITECTURE.md          # contract design, rounding rules, event table
└── DEPLOYMENT.md            # step-by-step testnet deployment guide
```

## Running locally

### Contracts

```bash
rustup target add wasm32-unknown-unknown
cargo test --workspace
cargo build --release --target wasm32-unknown-unknown
```

### Frontend

```bash
cd frontend
npm install
npm test
npm run lint
npm run dev
```

By default the frontend runs with no contract addresses configured and
shows a clear banner saying so — see [DEPLOYMENT.md](./DEPLOYMENT.md) for
deploying your own instance to testnet.

## Testing

- **Contracts:** 22 tests across both contracts — split validation (must
  sum to 10,000 bps, no length mismatches, no empty collaborator lists),
  lock governance (only Distributor can lock, no edits after lock), the
  full payment fan-out with exact balance assertions, a three-way split
  with a rounding remainder assigned to the owner, and repeat payments
  accumulating a running lifetime total.
- **Frontend:** 18 tests covering event-label formatting, the pure
  split-math preview helper (including the rounding-remainder case), and
  the split-bar visualization component.

Run `cargo test --workspace` and `cd frontend && npm test` locally, or
check the **Actions** tab on GitHub for CI runs.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deploying both contracts to
Stellar testnet, wiring up a test token, and deploying the frontend to
Vercel.

**Live demo:** _add your Vercel URL here after deploying_
**Registry contract:** _add your deployed contract ID here_
**Distributor contract:** _add your deployed contract ID here_
**Example transaction:** _add a transaction hash from a real interaction here_

## Screenshots

_Add screenshots here after deploying:_
- Mobile responsive UI
- CI/CD pipeline passing (GitHub Actions tab)
- Test output showing passing tests (`cargo test --workspace` and `npm test`)

## Demo video

_Add your 1–2 minute demo video link here._

## License

MIT
