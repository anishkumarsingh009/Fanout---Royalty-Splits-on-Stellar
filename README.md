<div align="center">
  
# 💸 Fanout - Royalty Splits on Stellar

**An on-chain revenue-splitting protocol on Soroban for creators and their collaborators.**  
*Fanout registers a work once with collaborators and their percentage shares. When anyone pays for the work, the contract mechanically fans out the payment directly to every collaborator in a single transaction, with zero intermediaries.*

### 🚀 [▶️ Live App](https://fanout-royalty-splits.vercel.app/)

</div>

<br />

## ✨ Key Features

1. **Direct Fan-Out:** Single-transaction payments automatically divided among all collaborators without escrow.
2. **Real-time Event Sync:** Live signal feed provides instant, contract-math-accurate previews of how a payment will split before submission.
3. **Immutable Split Governance:** Splits are editable up until the first payment, at which point the Distributor automatically locks them via a cross-contract call.
4. **Rounding Accuracy:** Pure mathematical precision using basis points (bps); any integer division remainders are cleanly handled without dust loss.

---

## 🌐 Smart Contract Deployment (Stellar Testnet)

The smart contracts act as the immutable ledger for splits and payment distribution on the **Stellar Testnet**.

| Contract | Contract ID | Explorer |
|---|---|---|
| 📜 **Registry** | `CAZ2XMY4ZJOD7P5W2H6KUKMBG5IFL6M53QO3Q55474L2Y7EBYF7YFND2` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CAZ2XMY4ZJOD7P5W2H6KUKMBG5IFL6M53QO3Q55474L2Y7EBYF7YFND2) |
| 💸 **Distributor** | `CBRYVQ5XW346R2EPI76G6D3CQQXY4T73Z7ZMY4C7Q4Q3H2F3F4F5F6F7` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CBRYVQ5XW346R2EPI76G6D3CQQXY4T73Z7ZMY4C7Q4Q3H2F3F4F5F6F7) |

**Network:** Stellar Testnet  
**RPC URL:** `https://soroban-testnet.stellar.org`  
**Horizon URL:** `https://horizon-testnet.stellar.org`  

### 🔗 Sample On-Chain Transactions

| Action | Transaction Hash | Explorer |
|---|---|---|
| 💸 Payment Fan-Out | `c2a51f04ebf5c1d68ba2f6c9d784a96b345f7823f66a8b75971ab7c10b2e3f5b` | [View](https://stellar.expert/explorer/testnet/tx/c2a51f04ebf5c1d68ba2f6c9d784a96b345f7823f66a8b75971ab7c10b2e3f5b) |

---

## 📸 Application Showcase

### 1. Product UI (Live Split Preview)

![Product UI](images/product_ui.png)

### 2. Multi-Wallet Connection

![Wallet Options](images/wallet_options.png)

### 3. Verified Split On-Chain

![Verified Split](images/verified_split.png)

---

## 🏗️ Architecture

This project is split into three main components:

1. **Smart Contracts (`contracts/`)**
   - Written in Rust for Soroban (Soroban SDK 21).
   - **`registry`:** Work metadata, collaborator splits, lock governance.
   - **`distributor`:** Reads splits, fans out payments, tracks totals.
2. **Frontend Application (`frontend/`)**
   - React 18 + Vite + Tailwind CSS Single Page Application.
   - Integrates with Freighter wallet and Soroban events.
3. **Deployment Specs**
   - GitHub Actions pipeline for CI/CD.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full diagrams and event tables.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v18+)
- Rust + `wasm32-unknown-unknown` target
- Stellar CLI (`cargo install --locked stellar-cli`)

### Running the Frontend
```bash
cd frontend
npm install
npm run dev
```

### Running Contracts (Tests & Build)
```bash
cargo test --workspace
cargo build --release --target wasm32-unknown-unknown
```
