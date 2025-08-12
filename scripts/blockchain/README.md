# PeerFact – Polygon Mumbai/Madara Testnet Deployment Guide

This guide helps you deploy the on-chain logging contract for PeerFact using Remix and MetaMask. No backend private keys are needed.

## What you’ll deploy
`PeerFactLog` – a minimal contract that stores an array of log entries and emits events when a claim verdict is finalized. It’s perfect for demo + paper screenshots and blockchain explorer links.

## Steps
1. Open https://remix.ethereum.org
2. Create a new file `PeerFact.sol` and paste the contents of `scripts/blockchain/PeerFact.sol`
3. On the left, go to "Solidity compiler", select version 0.8.20 (or compatible), and Compile
4. On the left, go to "Deploy & run transactions"
   - Environment: Injected Provider – MetaMask
   - Select the Polygon Mumbai test network (or another low-cost testnet)
   - Deploy `PeerFactLog`
5. After deployment, copy the Contract Address and save the ABI from Remix.
6. Share the following with me:
   - Contract address
   - ABI JSON

## Using it from the app (next step)
Once you provide the address+ABI, I’ll add a simple function on the backend to:
- Hash the claim text (`keccak256`)
- Call `logClaim(hash, verdict, topSources)` via MetaMask on the frontend or a safe relay approach you prefer.

## Notes
- For production-grade usage, we’ll add access control and a batching strategy.
- For demo, events + public entries array is sufficient to show provenance on-chain.