# 🏗️ Oclawd Architecture Documentation

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Blockchain Layer](#blockchain-layer)
4. [Backend Layer](#backend-layer)
5. [Frontend Layer](#frontend-layer)
6. [Database Schema](#database-schema)
7. [State Management](#state-management)
8. [Security Considerations](#security-considerations)
9. [Performance Optimization](#performance-optimization)

---

## System Overview

Oclawd is a **Three-Layer Architecture** that separates concerns for maintainability and scalability:

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND LAYER                    │
│  React + Vite + Tailwind + Web3 Integration         │
└────────────────────┬────────────────────────────────┘
                     │ REST API / WebSocket
┌────────────────────▼────────────────────────────────┐
│                 BACKEND LAYER                       │
│  Node.js/Express + PostgreSQL + Redis               │
└────────────────────┬────────────────────────────────┘
                     │ JSON-RPC / Event Subscriptions
┌────────────────────▼────────────────────────────────┐
│              BLOCKCHAIN LAYER                        │
│  Base Sepolia (L2) + Smart Contracts                │
└─────────────────────────────────────────────────────┘
```

---

## Blockchain Layer

### Network Selection: Base Sepolia Testnet

**Why Base?**
- Low gas fees (~$0.001 per transaction)
- Fast block times (~2 seconds)
- Strong developer ecosystem
- Seamless EVM compatibility
- Free testnet tokens available

### Contract Architecture

#### 1. Core Contracts

**OclawdGame.sol** - Main Game Contract
```solidity
// Key Functions
- mintShip(address player, uint256 shipType) - NFT minting
- buildStation(address player, uint256 stationType) - Station construction
- mineResource(address player, uint256 resourceType) - Resource extraction
- tradeResource(from, to, amount) - Resource exchange
- transferShip(from, to, tokenId) - Fleet management
```

**OclawdNFT.sol** - Fleet Ships ERC721
```solidity
// Features
- Unique ship designs (fighters, transports, cruisers)
- Rarity levels (common, rare, epic, legendary)
- Upgradeable attributes
- On-chain metadata
```

**OclawdStation.sol** - Station NFTs ERC1155
```solidity
// Features
- Orbital stations
- Planetary stations
- Mining facilities
- Production capabilities
```

**OclawdResource.sol** - Resource Tokens ERC20
```solidity
// Resources
- Mineral tokens (gold, silver, platinum)
- Energy tokens
- Technology tokens
- Tradeable on-chain
```

**OclawdMarketplace.sol** - Trading Interface
```solidity
// Features
- Auction system
- Direct trading
- Market history
- Reputation scoring
```

#### 2. Contract Interaction Flow

```
User Action → Frontend → Backend API → Contract Call → Blockchain
              ↓                          ↓                ↓
            Update State               Validate        Block mined
            Polling                    Rate Limit      Event emitted
            WebSocket                  Verify Auth      Indexer
```

---

## Backend Layer

### Technology Stack

**Node.js + Express**
- RESTful API design
- WebSocket for real-time updates
- Middleware for auth & rate limiting
- Service-oriented architecture

**Database: PostgreSQL**
- Relational data for games
- Optimized queries for player stats
- Transaction support
- Full-text search

**Cache: Redis**
- Session management
- API response caching
- Leaderboard caching
- Real-time state broadcasting

### API Endpoints

#### Core Endpoints

**Player Management**
```
GET  /api/players/:address          - Get player profile
POST /api/players                   - Create new player
GET  /api/players/:address/stats    - Get player stats
PUT  /api/players/:address/upgrade  - Upgrade player
```

**Fleet Management**
```
GET  /api/fleets/:address           - Get player fleet
POST /api/fleets/:address/ships     - Deploy new ship
PUT  /api/fleets/:address/move      - Move fleet
GET  /api/fleets/:address/targets   - Get targets
```

**Resource Management**
```
GET  /api/resources/:address        - Get resources
POST /api/resources/:address/mine   - Mine resources
POST /api/resources/:address/trade  - Trade resources
```

**Marketplace**
```
GET  /api/marketplace               - Browse marketplace
POST /api/marketplace/auction       - Create auction
GET  /api/marketplace/bids          - Get bids
```

**Leaderboard**
```
GET  /api/leaderboard/rank          - Get rankings
GET  /api/leaderboard/scores        - Get scores
```

### WebSocket Events

**Real-time Updates**
```javascript
// Client subscribes to
socket.emit('subscribe', { channel: 'player_updates', id: address })

// Server broadcasts
socket.emit('player_updated', { address, stats, resources })
socket.emit('fleet_moved', { fleet, position })
socket.emit('resource_mined', { resource, amount })
socket.emit('market_update', { item, price })
socket.emit('leaderboard_changed', { rankings })
```

---

## Frontend Layer

### Technology Stack

**React 18 + Vite**
- Fast HMR development
- Optimized production builds
- Modern component architecture
- TypeScript for type safety

**UI Framework: Tailwind CSS**
- Utility-first styling
- Responsive design
- Dark mode support
- Custom animations

**Web3 Integration**
- Ethers.js v6
- Contract interactions
- Wallet connection
- Event subscriptions

### Component Architecture

```
┌─────────────────────────────────────┐
│           App (Layout)               │
└─────────────────────────────────────┘
         │           │           │
┌────────▼───┐ ┌────▼──────┐ ┌───▼────────┐
│ Navigation │ │  Player   │ │  Market    │
│           │ │ Dashboard │ │            │
└───────────┘ └───────────┘ └────────────┘
         │           │           │
┌────────▼───────────▼─────────────┐
│         Main Game Area            │
│  ┌─────────┐ ┌─────────────────┐ │
│  │ Galaxy  │ │  Fleet  Manager │ │
│  │ View    │ │                 │ │
│  └─────────┘ └─────────────────┘ │
└─────────────────────────────────────┘
```

### Key Components

**AuthProvider** - Wallet connection & session management
**GalaxyMap** - Interactive star system view
**FleetManager** - Ship deployment & management
**ResourceMonitor** - Real-time resource tracking
**Marketplace** - Trading interface
**Leaderboard** - Rankings display

---

## Database Schema

### PostgreSQL Tables

#### Players Table
```sql
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    username VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP DEFAULT NOW(),
    reputation INTEGER DEFAULT 1000,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0
);
```

#### Fleet Table
```sql
CREATE TABLE fleets (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id),
    name VARCHAR(100),
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    speed INTEGER DEFAULT 10,
    defense INTEGER DEFAULT 50
);
```

#### Ships Table
```sql
CREATE TABLE ships (
    id SERIAL PRIMARY KEY,
    fleet_id INTEGER REFERENCES fleets(id),
    token_id BIGINT NOT NULL,  -- On-chain NFT token ID
    ship_type VARCHAR(50),      -- fighter, transport, cruiser
    rarity VARCHAR(20),        -- common, rare, epic, legendary
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Resources Table
```sql
CREATE TABLE resources (
    player_id INTEGER REFERENCES players(id),
    resource_type VARCHAR(50) NOT NULL,
    amount INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT NOW(),
    UNIQUE(player_id, resource_type)
);
```

#### Market Transactions Table
```sql
CREATE TABLE market_transactions (
    id SERIAL PRIMARY KEY,
    from_player_id INTEGER REFERENCES players(id),
    to_player_id INTEGER REFERENCES players(id),
    item_type VARCHAR(50),
    amount INTEGER,
    price INTEGER,
    tx_hash VARCHAR(66),
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Leaderboard Table
```sql
CREATE TABLE leaderboard (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id),
    score INTEGER DEFAULT 0,
    rank INTEGER,
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Redis Cache Structure

```
# Player sessions
player:{address} -> {session_data, expiry: 3600}

# API cache (5 minutes)
api:leaderboard -> {rankings, timestamp}
api:marketplace -> {items, timestamp}

# Real-time state
fleet:{address} -> {fleet_data, last_updated}
resource:{address} -> {resources, last_updated}

# Leaderboard (updated every 30 seconds)
leaderboard:top10 -> {rankings, timestamp}
```

---

## State Management

### Frontend State

**React Context** - Global state
```javascript
// OclawdContext
{
  player: { address, stats, fleet, resources },
  contracts: { game, nft, resource },
  marketplace: { items, bids },
  leaderboard: { rankings },
  web3: { provider, account }
}
```

**WebSocket State** - Real-time updates
```javascript
socket.on('player_updated', (data) => {
  setPlayer(prev => ({ ...prev, ...data }))
})

socket.on('market_update', (data) => {
  setMarketplace(prev => ({
    ...prev,
    [data.id]: data
  }))
})
```

### Backend State

**REST API State** - HTTP requests
```javascript
// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100  // limit each IP to 100 requests per window
}))

// Caching middleware
app.use('/api/leaderboard', cacheMiddleware(5 * 60 * 1000))
```

**WebSocket State** - Active connections
```javascript
// Connection management
io.on('connection', (socket) => {
  const playerAddress = socket.handshake.query.address

  // Subscribe to player updates
  socket.join(`player:${playerAddress}`)

  // Broadcast updates
  io.to(`player:${playerAddress}`)
    .emit('player_updated', playerData)
})
```

---

## Security Considerations

### Smart Contract Security

1. **Access Control**
   - Only player can interact with own assets
   - Role-based permissions for admins
   - Input validation on all functions

2. **Reentrancy Protection**
   - Checks-effects-interactions pattern
   - ReentrancyGuard for critical functions

3. **Gas Optimization**
   - Minimal storage operations
   - Event emission instead of storage
   - Efficient data structures

4. **Front-running Protection**
   - Time-locked transactions
   - Slippage protection
   - Auction mechanics

### Backend Security

1. **Authentication**
   - JWT tokens for API auth
   - Wallet signature verification
   - Session expiration

2. **Rate Limiting**
   - API request limits
   - Prevent spam
   - Abuse detection

3. **Input Validation**
   - Sanitize all inputs
   - Check for malicious patterns
   - Format validation

4. **HTTPS Only**
   - Force secure connections
   - Certificate validation
   - Prevent MITM attacks

### Frontend Security

1. **Wallet Connection**
   - Only connect to user's wallet
   - Prevent unauthorized access
   - Clear disconnect UX

2. **Input Sanitization**
   - Prevent XSS attacks
   - Safe user-generated content
   - URL validation

3. **CSP Headers**
   - Content security policy
   - Prevent script injection
   - Secure resource loading

4. **HTTPS Enforcement**
   - Redirect to secure connection
   - Prevent mixed content
   - HSTS headers

---

## Performance Optimization

### Smart Contract Optimization

1. **Batch Operations**
   - Multiple actions in single transaction
   - Reduced gas costs
   - Atomic execution

2. **Event Emission**
   - Cheap state changes
   - Frontend subscribes to events
   - Off-chain indexing

3. **Storage Reduction**
   - Use packed structs
   - Minimize storage variables
   - Cache in contract memory

### Backend Optimization

1. **Database Indexing**
   - Index wallet addresses
   - Index timestamps
   - Optimize query performance

2. **Query Optimization**
   - Pagination for large datasets
   - N+1 query prevention
   - Efficient joins

3. **Connection Pooling**
   - PostgreSQL connection pool
   - Reuse connections
   - Prevent bottlenecks

4. **Caching Strategy**
   - Redis for frequent queries
   - Cache invalidation strategy
   - TTL-based expiration

### Frontend Optimization

1. **Code Splitting**
   - Dynamic imports
   - Route-based splitting
   - Reduced initial bundle

2. **Lazy Loading**
   - React.lazy for components
   - Image optimization
   - Font loading strategy

3. **Bundle Optimization**
   - Vite build optimization
   - Tree shaking
   - Minification

4. **WebSocket Optimization**
   - Efficient message serialization
   - Batch updates
   - Smart reconnection

---

## Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────────────┐
│                  Nginx (Reverse Proxy)          │
│                  Load Balancer                   │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│              Frontend (React + Vite)             │
│               CDN / Cloudflare                   │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│            Backend API (Node.js + Express)       │
│        PostgreSQL + Redis + Socket.io           │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│          Blockchain (Base Mainnet)               │
│      Smart Contracts + Indexer                   │
└─────────────────────────────────────────────────┘
```

### CI/CD Pipeline

```bash
# Build & Test
npm run build
npm test
npm run lint

# Deploy Frontend
npm run deploy:frontend

# Deploy Contracts
npm run deploy:contracts

# Deploy Backend
npm run deploy:backend
```

---

## Monitoring & Metrics

### Key Metrics

**Performance**
- API response time < 200ms
- WebSocket latency < 50ms
- Database query time < 100ms

**Business**
- Active players per day
- Transaction volume
- Average gas spent per transaction

**Technical**
- Contract deployment count
- Gas costs per transaction
- Contract interaction frequency

### Logging

```
# Centralized logging (Elasticsearch + Kibana)
- API requests
- WebSocket events
- Smart contract interactions
- Database queries

# Monitoring
- Uptime monitoring
- Error tracking
- Performance metrics
```

---

## Future Enhancements

### Phase 2 Features
- Mobile-responsive design
- Additional NFT series
- Staking rewards
- PvP battles
- Guild system

### Phase 3 Features
- Real marketplace integration
- Governance tokens
- Cross-chain compatibility
- Mobile app development

---

**Last Updated:** Feb 4, 2026
**Version:** 1.0.0
**Status:** Ready for Hackathon Deployment
