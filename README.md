# 🚀 Oclawd - Space Strategy Game

A fully on-chain space strategy game built on Base Sepolia. Build fleets, establish stations, mine resources, and compete for galactic dominance.

![Base](https://img.shields.io/badge/Base-Sepolia-blue)
![Solidity](https://img.shields.io/badge/Solidity-0.8.20-purple)
![React](https://img.shields.io/badge/React-18-61dafb)
![License](https://img.shields.io/badge/License-MIT-green)

## 🎮 Live Demo

**[Play Oclawd](https://oclawd.vercel.app)** *(deployment in progress)*

## ✨ Features

### Blockchain
- **NFT Ships** - ERC721 fleet with unique attributes and rarity tiers
- **Resource Tokens** - ERC20 tokens for minerals, energy, tech, and credits
- **On-Chain Marketplace** - Trade ships and resources with other players
- **Transparent Economy** - All transactions verifiable on-chain

### Gameplay
- **4 Ship Types** - Fighters, Transports, Cruisers, Battleships
- **4 Rarity Tiers** - Common, Rare, Epic, Legendary
- **Station Building** - Mining, production, trading, defense
- **PvP Combat** - Attack other players for resources
- **Leaderboards** - Compete globally

### Tech Stack
- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Node.js + Express + PostgreSQL
- **Blockchain:** Solidity + Hardhat + Base Sepolia
- **Web3:** wagmi + viem

## 🏁 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- MetaMask wallet
- Base Sepolia testnet ETH ([get free](https://faucet.quicknode.com/base/sepolia))

### Installation

```bash
# Clone the repo
git clone https://github.com/clementfrmd/oclawd-game.git
cd oclawd-game

# Install all dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
cd ../contracts && npm install
```

### Configuration

1. **Backend** - Create `backend/.env`:
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/oclawd
JWT_SECRET=your-secret-key
RPC_URL=https://sepolia.base.org
```

2. **Contracts** - Create `contracts/.env`:
```env
PRIVATE_KEY=your-deployer-private-key
BASE_SEPOLIA_RPC=https://sepolia.base.org
```

3. **Frontend** - Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:3001
VITE_CHAIN_ID=84532
```

### Run Locally

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Deploy contracts (optional)
cd contracts && npx hardhat run scripts/deploy.js --network baseSepolia
```

Visit `http://localhost:5173`

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [🎮 Gameplay Guide](docs/gameplay.md) | How to play, mechanics, strategies |
| [💰 Economy Guide](docs/economy.md) | Tokenomics, trading, earning |
| [📖 Instructions](docs/instructions.md) | Getting started in 5 minutes |
| [🏗️ Architecture](docs/architecture.md) | Technical deep-dive |

## 🏗️ Project Structure

```
oclawd-game/
├── contracts/           # Solidity smart contracts
│   ├── contracts/       # Source files
│   ├── scripts/         # Deployment scripts
│   └── test/            # Contract tests
├── backend/             # Node.js API server
│   ├── src/             # Express routes & services
│   └── models/          # Sequelize models
├── frontend/            # React application
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Route pages
│   │   └── hooks/       # Custom React hooks
│   └── public/          # Static assets
├── docs/                # Documentation
└── k8s/                 # Kubernetes configs
```

## 🔗 Smart Contracts

| Contract | Description |
|----------|-------------|
| `OclawdGame.sol` | Main game logic - ships, stations, resources |
| `OclawdNFT.sol` | ERC721 ship NFTs with attributes |
| `OclawdStation.sol` | ERC1155 station NFTs |
| `OclawdResource.sol` | ERC20 resource tokens |
| `OclawdMarketplace.sol` | Trading and auctions |

### Deployed Addresses (Base Sepolia)
*Coming soon after deployment*

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy to Vercel
```

### Backend (Docker)
```bash
docker build -t oclawd-backend ./backend
docker run -p 3001:3001 oclawd-backend
```

### Contracts (Hardhat)
```bash
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.js --network baseSepolia
```

## 🧪 Testing

```bash
# Contract tests
cd contracts && npx hardhat test

# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## 🗺️ Roadmap

- [x] Core smart contracts
- [x] Backend API
- [x] Frontend UI
- [ ] Mainnet deployment
- [ ] Mobile app
- [ ] Alliances/guilds
- [ ] Cross-chain bridges
- [ ] DAO governance

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🔗 Links

- **Game:** [oclawd.vercel.app](https://oclawd.vercel.app)
- **GitHub:** [github.com/clementfrmd/oclawd-game](https://github.com/clementfrmd/oclawd-game)
- **Farcaster:** /oclawd
- **Twitter:** [@OclawdGame](https://twitter.com/OclawdGame)

---

*Built with 🦀 by Clawdberg*
