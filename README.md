<div align="center">
  
# 💸 Fanout - Royalty Splits on Stellar

**An on-chain revenue-splitting protocol on Soroban for creators and their collaborators.**  
*Fanout registers a work once with collaborators and their percentage shares. When anyone pays for the work, the contract mechanically fans out the payment directly to every collaborator in a single transaction, with zero intermediaries.*

### 🚀 [▶️ Live App](https://fanout-royalty-splits-on-stellar-ot.vercel.app/) | 🎥 [Demo Video](https://drive.google.com/file/d/11yAUPp_xOQlBW2uhC7VJKiyBOIFi4qaY/view?usp=sharing)

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
| 📜 **Registry** | `CBH2UKZPUQEKTJ375GMFRVVKSUJEAG43Z2QK5UNG5ASC2WCUMFP4HL5D` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CBH2UKZPUQEKTJ375GMFRVVKSUJEAG43Z2QK5UNG5ASC2WCUMFP4HL5D) |
| 💸 **Distributor** | `CCGEP2DV442ZVN4UMJQDLISCZEVBKVGD2Q7CVQ6JN5C6XFQ5P4HXU2PZ` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CCGEP2DV442ZVN4UMJQDLISCZEVBKVGD2Q7CVQ6JN5C6XFQ5P4HXU2PZ) |

**Network:** Stellar Testnet  
**RPC URL:** `https://soroban-testnet.stellar.org`  
**Horizon URL:** `https://horizon-testnet.stellar.org`  

### 🔗 Sample On-Chain Transactions

| Action | Transaction Hash | Explorer |
|---|---|---|
| 💸 Payment Fan-Out | `7664bb971883850f39de438936cdeedf24c8ec2367b9d609b85a29c087e04d57` | [View](https://stellar.expert/explorer/testnet/tx/7664bb971883850f39de438936cdeedf24c8ec2367b9d609b85a29c087e04d57) |

---

## 📸 Application Showcase

### 1. Product UI
![Product UI](images/product%20ui.png)

### 2. Mobile Responsive UI
![Mobile UI](images/Mobile%20ui.png)

### 3. CI/CD Pipeline
![CI/CD](images/CI%20CD.png)

### 4. Passing Test Output
![Test Output](images/test%20output.png)

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
