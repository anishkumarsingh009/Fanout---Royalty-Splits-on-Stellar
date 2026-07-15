<div align="center">
  
# 💸 Fanout - Royalty Splits on Stellar

**An on-chain revenue-splitting protocol on Soroban for creators and their collaborators.**  
*Fanout registers a work once with collaborators and their percentage shares. When anyone pays for the work, the contract mechanically fans out the payment directly to every collaborator in a single transaction, with zero intermediaries.*

[![Stellar](https://img.shields.io/badge/Stellar-Soroban-blue.svg)](https://stellar.org/soroban)
[![Vite](https://img.shields.io/badge/Frontend-Vite_React-black.svg)](https://vitejs.dev/)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black.svg?logo=vercel)](https://fanout-royalty-splits-on-stellar-ot.vercel.app/)
[![Video Demo](https://img.shields.io/badge/Video%20Demo-Google%20Drive-red.svg?logo=google-drive)](https://drive.google.com/file/d/11yAUPp_xOQlBW2uhC7VJKiyBOIFi4qaY/view?usp=sharing)

### 🔗 [▶️ Live App](https://fanout-royalty-splits-on-stellar-ot.vercel.app/) &nbsp;|&nbsp; [🎥 Video Demo](https://drive.google.com/file/d/11yAUPp_xOQlBW2uhC7VJKiyBOIFi4qaY/view?usp=sharing)

</div>

<br />

## 🌟 Key Features

1. **Direct Fan-Out:** Single-transaction payments automatically divided among all collaborators without escrow.
2. **Real-time Event Sync:** Live signal feed provides instant, contract-math-accurate previews of how a payment will split before submission.
3. **Immutable Split Governance:** Splits are editable up until the first payment, at which point the Distributor automatically locks them via a cross-contract call.
4. **Rounding Accuracy:** Pure mathematical precision using basis points (bps); any integer division remainders are cleanly handled without dust loss.

---

## 🚀 Smart Contract Deployment (Stellar Testnet)

The smart contracts are live and deployed to the **Stellar Testnet** via automated CI/CD (GitHub Actions). All contract interactions use the native **XLM** token.

| Contract | Contract ID | Explorer |
|---|---|---|
| 📜 **Registry** | `CBH2UKZPUQEKTJ375GMFRVVKSUJEAG43Z2QK5UNG5ASC2WCUMFP4HL5D` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CBH2UKZPUQEKTJ375GMFRVVKSUJEAG43Z2QK5UNG5ASC2WCUMFP4HL5D) |
| 💸 **Distributor** | `CCGEP2DV442ZVN4UMJQDLISCZEVBKVGD2Q7CVQ6JN5C6XFQ5P4HXU2PZ` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CCGEP2DV442ZVN4UMJQDLISCZEVBKVGD2Q7CVQ6JN5C6XFQ5P4HXU2PZ) |

**Sample Transaction:** [View Contract Interaction Hash](https://stellar.expert/explorer/testnet/tx/7664bb971883850f39de438936cdeedf24c8ec2367b9d609b85a29c087e04d57)

---

## 📸 Screenshots

**Product UI & Mobile Responsiveness**
<p align="center">
  <img src="images/product%20ui.png" width="48%" />
  <img src="images/Mobile%20ui.png" width="48%" />
</p>

**CI/CD Pipeline Running**
<p align="center">
  <img src="images/CI%20CD.png" width="80%" />
</p>

**Test Output (3+ Passing Tests)**
<p align="center">
  <img src="images/test%20output.png" width="80%" />
</p>

---

## 🛠️ Tech Stack

- **Smart Contracts:** Rust, Soroban SDK
- **Frontend:** React 18, Vite, Tailwind CSS
- **Wallet Integration:** Freighter / Stellar Wallets Kit
- **CI/CD:** GitHub Actions (Automated build, test, and deploy)

## 📖 Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/anishkumarsingh009/Fanout---Royalty-Splits-on-Stellar.git
   cd Fanout---Royalty-Splits-on-Stellar
   ```

2. **Run Contract Tests:**
   ```bash
   cargo test --workspace
   ```

3. **Start the Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
