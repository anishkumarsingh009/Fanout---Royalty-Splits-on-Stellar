# Deployment Guide

Deploying both contracts to Stellar testnet and wiring up the frontend
takes about 15–20 minutes. Do this yourself — the addresses and
transaction hash the competition checklist asks for need to come from a
real deployment.

## 0. Prerequisites

```bash
rustup target add wasm32-unknown-unknown
cargo install --locked soroban-cli --features opt
node --version   # 20+
```

Install the [Freighter wallet extension](https://freighter.app) and switch
its network to **Testnet**.

## 1. Create and fund a deployer identity

```bash
soroban keys generate deployer --network testnet
soroban keys fund deployer --network testnet
soroban keys address deployer
```

## 2. Build the contracts

```bash
cargo build --target wasm32-unknown-unknown --release
```

Produces:
- `target/wasm32-unknown-unknown/release/registry.wasm`
- `target/wasm32-unknown-unknown/release/distributor.wasm`

## 3. Deploy the Distributor contract

Deploy Distributor first since Registry's `initialize` needs its address:

```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/distributor.wasm \
  --source deployer \
  --network testnet
```

Save the printed ID as `DISTRIBUTOR_ID`.

## 4. Deploy the Registry contract

```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/registry.wasm \
  --source deployer \
  --network testnet
```

Save the printed ID as `REGISTRY_ID`, then initialize, pointing it at the
Distributor contract:

```bash
soroban contract invoke \
  --id $REGISTRY_ID \
  --source deployer \
  --network testnet \
  -- initialize \
  --admin $(soroban keys address deployer) \
  --distributor_contract $DISTRIBUTOR_ID
```

## 5. Initialize the Distributor contract

```bash
soroban contract invoke \
  --id $DISTRIBUTOR_ID \
  --source deployer \
  --network testnet \
  -- initialize \
  --admin $(soroban keys address deployer) \
  --registry_contract $REGISTRY_ID
```

## 6. Get a test token

```bash
soroban contract asset deploy \
  --asset native \
  --source deployer \
  --network testnet
```

Save the printed address as `TOKEN_ID`.

## 7. Register a work and make a payment (for your transaction hash)

```bash
soroban keys generate collaborator_a --network testnet
soroban keys generate collaborator_b --network testnet
soroban keys generate payer --network testnet
soroban keys fund payer --network testnet
```

Register a work with a 60/40 split:

```bash
soroban contract invoke \
  --id $REGISTRY_ID \
  --source deployer \
  --network testnet \
  -- register_work \
  --owner $(soroban keys address deployer) \
  --title "Midnight Sessions EP" \
  --collaborators '["'$(soroban keys address collaborator_a)'","'$(soroban keys address collaborator_b)'"]' \
  --shares_bps '[6000,4000]'
```

This returns a `work_id` (starts at 0). Make a payment:

```bash
soroban contract invoke \
  --id $DISTRIBUTOR_ID \
  --source payer \
  --network testnet \
  -- distribute_payment \
  --payer $(soroban keys address payer) \
  --work_id 0 \
  --token $TOKEN_ID \
  --amount 1000000000
```

The CLI output includes the transaction hash — this is your submission's
required transaction hash.

## 8. Configure the frontend

```bash
cd frontend
cp .env.example .env
```

Fill in:

```
VITE_REGISTRY_CONTRACT_ID=<REGISTRY_ID>
VITE_DISTRIBUTOR_CONTRACT_ID=<DISTRIBUTOR_ID>
VITE_TOKEN_CONTRACT_ID=<TOKEN_ID>
```

```bash
npm install
npm run dev
```

## 9. Deploy to Vercel

```bash
npm install -g vercel
cd frontend
vercel
```

Set the same `VITE_*` variables in **Settings → Environment Variables**,
then redeploy.

## Checklist mapping

| Item | Where to get it |
|---|---|
| Contract deployment address | `$REGISTRY_ID` and `$DISTRIBUTOR_ID` from steps 3–4 |
| Transaction hash | Output of the `distribute_payment` call in step 7 |
| Live demo link | Your Vercel deployment URL |
| CI/CD screenshot | Green checks on the GitHub Actions tab |
| Test output screenshot | `cargo test --workspace` and `npm test` in your terminal |
| Mobile UI screenshot | Vercel URL on your phone, or dev tools device toolbar |
