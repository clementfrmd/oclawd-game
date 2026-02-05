# Oclawd Game Design v2 - Simplified Economy

## 🎯 Design Principles

Based on OGame mechanics, simplified for blockchain:

1. **Minimal tokens** - Reduce complexity and gas costs
2. **Planet as SBT** - One free planet per player (gas only)
3. **Resources = currency** - No separate ERC20s, tracked in-contract
4. **Progressive gameplay** - Start simple, unlock complexity

---

## 📦 Token Structure (Simplified)

### Before (Too Complex)
```
❌ OclawdGame (ERC721) - Ships
❌ OclawdNFT (ERC721) - More ships?
❌ OclawdStation (ERC1155) - Stations
❌ OclawdResource (ERC20) - Tokens
❌ OclawdMarketplace - Trading
= 5 contracts, confusing
```

### After (Minimal)
```
✅ OclawdPlanet (ERC721 SBT) - One per player, free mint
✅ OclawdCore - Game logic + resource tracking
= 2 contracts, clean
```

---

## 🌍 Core Concept: The Planet

Each player gets **ONE planet** (Soulbound Token):

```solidity
// Free mint - player pays only gas
function claimPlanet() external {
    require(balanceOf(msg.sender) == 0, "Already has planet");
    _mint(msg.sender, nextPlanetId++);
    _initializePlanet(nextPlanetId - 1);
}

// Soulbound - cannot transfer
function _beforeTokenTransfer(...) internal override {
    require(from == address(0), "Soulbound: cannot transfer");
}
```

### Planet Properties
- **Coordinates** (x, y, z) - Unique location in galaxy
- **Fields** - Building slots (start with 163, can expand)
- **Temperature** - Affects deuterium production
- **Resources** - Metal, Crystal, Deuterium balances

---

## ⛏️ Resources (OGame-style)

### Three Resources (tracked in-contract, not ERC20)

| Resource | Role | Production |
|----------|------|------------|
| **Metal** | Primary building material | Fast, abundant |
| **Crystal** | Tech & advanced buildings | Medium |
| **Deuterium** | Ship fuel & high-tier | Slow, valuable |

### Production Formula (per OGame)
```
Metal/hour = 30 * mineLevel * 1.1^mineLevel
Crystal/hour = 20 * mineLevel * 1.1^mineLevel  
Deuterium/hour = 10 * mineLevel * 1.1^mineLevel * (1.28 - 0.002 * temperature)
```

### Energy Requirement
- Mines require energy to operate
- Energy from: Solar Plant, Solar Satellites
- No energy = no production

---

## 🏗️ Buildings

All buildings are **upgradeable levels** on your planet (not NFTs):

### Resource Buildings
| Building | Function | Cost Scaling |
|----------|----------|--------------|
| Metal Mine | Produces Metal | 60M, 15C per level |
| Crystal Mine | Produces Crystal | 48M, 24C per level |
| Deuterium Synthesizer | Produces Deuterium | 225M, 75C per level |
| Solar Plant | Generates Energy | 75M, 30C per level |

### Facility Buildings
| Building | Function | Unlock |
|----------|----------|--------|
| Robotics Factory | Speeds up construction | Level 2 Metal Mine |
| Shipyard | Build ships | Robotics Lvl 2 |
| Research Lab | Unlock technologies | Shipyard Lvl 1 |
| Nanite Factory | Major speed boost | Late game |

### Storage Buildings
| Building | Function |
|----------|----------|
| Metal Storage | Increase Metal capacity |
| Crystal Storage | Increase Crystal capacity |
| Deuterium Tank | Increase Deuterium capacity |

---

## 🚀 Ships

Ships are built in the Shipyard using resources:

### Ship Types (OGame-inspired)

| Ship | Metal | Crystal | Deuterium | Role |
|------|-------|---------|-----------|------|
| Light Fighter | 3,000 | 1,000 | 0 | Basic combat |
| Heavy Fighter | 6,000 | 4,000 | 0 | Combat |
| Cruiser | 20,000 | 7,000 | 2,000 | Anti-fighter |
| Battleship | 45,000 | 15,000 | 0 | Heavy combat |
| Small Cargo | 2,000 | 2,000 | 0 | Transport 5k |
| Large Cargo | 6,000 | 6,000 | 0 | Transport 25k |
| Colony Ship | 10,000 | 20,000 | 10,000 | Colonize |
| Recycler | 10,000 | 6,000 | 2,000 | Collect debris |
| Espionage Probe | 0 | 1,000 | 0 | Spy |

### Ship Storage
- Ships stored as quantities per player (not individual NFTs)
- Example: `ships[playerId][LIGHT_FIGHTER] = 50`
- Saves massive gas vs minting NFT per ship

---

## ⚔️ Combat System

### OGame-Style Combat
1. Attacker sends fleet to target coordinates
2. Fleet travel time based on distance + engine tech
3. Combat resolves in rounds (1-6)
4. Surviving ships return with plundered resources
5. Destroyed ships create **debris field**

### Combat Formula
```
Damage = Attack * Random(0.8 to 1.2)
Destroyed if Damage > (Shield + Hull)
```

### Debris Fields
- 30% of destroyed ships' Metal + Crystal become debris
- Can be collected with Recyclers
- Large debris fields can form **Moons** (rare)

---

## 🔬 Research/Technologies

Research unlocks new ships and improves existing ones:

| Technology | Effect |
|------------|--------|
| Energy Tech | More efficient power |
| Laser Tech | Unlock laser weapons |
| Armor Tech | +10% hull per level |
| Weapons Tech | +10% attack per level |
| Shielding Tech | +10% shields per level |
| Combustion Drive | Faster ships |
| Impulse Drive | Even faster |
| Hyperspace Drive | Fastest |
| Espionage Tech | Better spy reports |
| Astrophysics | More colonies |

---

## 🎮 Game Loop

```
1. CLAIM PLANET (free, SBT)
        ↓
2. BUILD MINES (Metal first, then Crystal, then Deuterium)
        ↓
3. BUILD SOLAR PLANT (to power mines)
        ↓
4. COLLECT RESOURCES (passive generation)
        ↓
5. BUILD SHIPYARD → BUILD SHIPS
        ↓
6. RAID OTHER PLAYERS (steal resources)
        ↓
7. EXPAND → Research → More ships → Dominate
```

---

## 💰 Economy Balance

### Why This Works

1. **No Token Inflation**: Resources are generated and consumed, not traded as ERC20s
2. **Skill-Based**: Strategic building order matters
3. **PvP Incentive**: Raiding is profitable, creates engagement
4. **Progression**: Clear upgrade path keeps players engaged

### Anti-Abuse Measures
- Production caps based on storage
- Fleetsave mechanics (send fleet on long mission before logout)
- Attack cooldowns
- Newbie protection (first 7 days or until X points)

---

## 📊 Comparison: Current vs Proposed

| Aspect | Current | Proposed |
|--------|---------|----------|
| Contracts | 5 | 2 |
| Tokens per player | Many NFTs | 1 SBT + resources |
| Mint cost | ETH per ship | Free planet, gas only |
| Complexity | High | OGame-proven model |
| Gas costs | High (multiple txs) | Low (batch operations) |
| Fun factor | ??? | Time-tested 20+ years |

---

## 🛠️ Implementation Plan

### Phase 1: Core (Week 1)
1. OclawdPlanet.sol - SBT planet mint
2. Resource system (in-contract mappings)
3. Basic buildings (mines + solar)
4. Resource generation

### Phase 2: Ships (Week 2)
1. Shipyard building
2. Ship construction
3. Fleet management
4. Basic movement

### Phase 3: Combat (Week 3)
1. Attack system
2. Combat resolution
3. Debris fields
4. Resource plundering

### Phase 4: Polish (Week 4)
1. Research system
2. UI improvements
3. Balancing
4. Mainnet deployment

---

## 🎯 Success Metrics

- **Retention**: Players return daily to collect resources
- **Engagement**: Active raiding and trading
- **Growth**: New players joining (free mint helps)
- **Economy**: Balanced resource sinks and sources

---

*Based on OGame mechanics that have proven successful for 20+ years.*
