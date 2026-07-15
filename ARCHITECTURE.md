# Architecture

## Why two contracts

A single contract could store splits and move money in one place — but
that would mean the fund-moving contract also has to embed governance
logic for who can edit a split and when. This project separates them:

```
┌────────────────────┐   get_work() / lock_work()   ┌──────────────────────┐
│ Distributor Contract│ ─────────────────────────────▶│ Registry Contract     │
│ - reads splits        │◀─────────────────────────────│ - Work { splits }      │
│ - pays every           │      returns Work / ack       │ - lock/edit rules      │
│   collaborator directly│                              │ - never touches funds  │
└──────────┬─────────┘                                └──────────────────────┘
           │ cross-contract call (fan-out — one call per collaborator)
           ▼
┌────────────────────┐
│  Token Contract      │  (SEP-41 / Stellar Asset Contract)
│  - transfer()          │
└────────────────────┘
```

- **Registry** owns splits and governance (who can edit, when edits are
  locked) but never sees a token contract. It has no idea money is
  changing hands — it just answers "what are the current splits for this
  work?" and "has this been locked?"
- **Distributor** owns the actual payment fan-out. It never stores splits
  itself — every payment re-reads the Registry's current state, then
  performs `N` direct transfers (payer → each collaborator) in a single
  transaction. Funds never sit inside the Distributor contract itself,
  which limits what a bug in Distributor could ever put at risk.
- The **lock** mechanic is the interesting cross-contract coupling:
  Distributor is the only address Registry will accept a `lock_work` call
  from, and Distributor calls it automatically the first time a payment
  goes through — freezing splits from further edits so collaborators can
  trust the deal once money has started flowing.

## Why basis points, not percentages

Splits are stored as `u32` basis points (10,000 = 100.00%) rather than
floats, since Soroban contract storage has no native floating-point type
and financial math on floats is generally unsound anyway. `register_work`
and `update_splits` both reject any split whose basis points don't sum to
exactly 10,000.

## Rounding

Integer division (`amount * bps / 10_000`) can leave a small remainder
uncollected when splits don't divide the payment evenly (e.g. three equal
collaborators splitting an amount not divisible by 3). Rather than losing
that dust or arbitrarily assigning it to the first collaborator,
`distribute_payment` sends the full remainder to the work's `owner` —
consistent with the intuition that the registrant is the "residual
claimant" for anything left over after fixed shares are paid.

## Events (the "real-time" layer)

| Event topics | Emitted when |
|---|---|
| `work, created` | A creator registers a new work |
| `work, updated` | Splits are edited (only possible before lock) |
| `work, locked` | Distributor locks splits on first payment |
| `payment, split` | A payment is distributed across collaborators |

The frontend polls `getEvents` (`useEventStream`) for the live "Signal
Feed," and separately renders an **instant client-side preview** of any
payment amount using `splitMath.js` — a pure function that mirrors the
contract's integer-division rounding exactly, so what the payer sees
before submitting matches what actually happens on-chain to the last unit.

## Frontend structure

```
frontend/src/
├── lib/
│   ├── config.js             # env-driven contract addresses & network config
│   ├── wallet.js               # Freighter wallet integration
│   ├── sorobanClient.js         # low-level build/simulate/sign/submit
│   ├── fanoutActions.js         # typed wrappers per contract method
│   ├── events.js                 # getEvents polling with ledger cursor
│   ├── formatEvent.js            # pure event -> label mapping (unit tested)
│   └── splitMath.js              # pure split-preview math (unit tested)
├── hooks/
│   ├── useWallet.js
│   └── useEventStream.js
└── components/                   # presentational, mobile-first with Tailwind
```

## Security notes

- `register_work` and `update_splits` both call `require_auth()` on the
  claimed owner, and `update_splits` additionally checks the stored owner
  matches the caller.
- `lock_work` requires the *Distributor contract's own address* to
  authorize — no other caller, including the work's owner, can lock (or
  un-lock; there's no unlock function at all) a work's splits.
- `distribute_payment` requires the payer's own authorization once, which
  Soroban's auth framework extends to cover every sub-call in the same
  invocation tree — so a single signature authorizes transfers to every
  collaborator plus the owner's remainder, not just the first transfer.
- Splits can't be edited after lock (`WorkLocked`), and basis points are
  validated to sum to exactly 10,000 on every write, preventing a split
  that silently under- or over-allocates a payment.
