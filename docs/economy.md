# 💰 Oclawd Game Economy

## Overview

Oclawd features a fully on-chain economy powered by Base Sepolia. Every asset, transaction, and trade is transparent and verifiable.

---

## Token Types

### 🚀 Ship NFTs (ERC721)

Each ship is a unique non-fungible token with on-chain metadata.

**Properties:**
- Unique token ID
- Ship type (Fighter, Transport, Cruiser, Battleship)
- Rarity tier (Common, Rare, Epic, Legendary)
- Dynamic attributes that can be upgraded
- Full ownership and transferability

**Minting Cost:**
| Ship Type | Base Price | Rarity Multiplier |
|-----------|------------|-------------------|
| Fighter | 0.001 ETH | 1x - 4x |
| Transport | 0.002 ETH | 1x - 4x |
| Cruiser | 0.005 ETH | 1x - 4x |
| Battleship | 0.01 ETH | 1x - 4x |

---

### 🏭 Station NFTs (ERC1155)

Stations are semi-fungible tokens - each type is fungible, but stations as a category are distinct.

**Properties:**
- Station type determines function
- Production capacity
- Resource generation rate
- Defense value

**Build Cost:** 0.01 ETH per station

---

### 🪙 Resource Tokens (ERC20)

Four resource types power the economy:

| Resource | Symbol | Use Case |
|----------|--------|----------|
| Minerals | MIN | Ship building, repairs |
| Energy | NRG | Station power, operations |
| Technology | TECH | Upgrades, research |
| Credits | CRED | Universal trading currency |

**Initial Distribution:**
- New players receive 100 CRED starter bonus
- Resources are mined, not pre-minted
- Total supply grows with player activity

---

## Economic Flows

### Value Creation

```
MINING          PRODUCTION        TRADING
   │                │                │
   ▼                ▼                ▼
Resources  →   Ship Building  →   Marketplace
   │                │                │
   └────────────────┴────────────────┘
                    │
                    ▼
              Player Wealth
```

### Sinks (Value Destruction)

To prevent inflation, the economy includes sinks:

1. **Ship Minting Fees** - ETH goes to treasury
2. **Station Building Costs** - ETH burned
3. **Combat Losses** - Ships can be destroyed
4. **Upgrade Costs** - Resources consumed
5. **Trading Fees** - 2.5% marketplace fee

---

## Marketplace

### Trading Mechanics

**Direct Sales:**
- List ships/resources at fixed price
- Instant purchase available
- Seller pays listing fee (0.001 ETH)

**Auctions:**
- Set starting price and duration
- Highest bidder wins
- Reserve price optional
- Auto-extension on last-minute bids

### Fee Structure

| Action | Fee |
|--------|-----|
| List item | 0.001 ETH |
| Successful sale | 2.5% of price |
| Cancel listing | Free |
| Auction (seller) | 3% of final price |

---

## Price Discovery

### Ship Valuation

Ship value depends on:

```
Base Value = Mint Cost × Rarity Multiplier
Market Value = Base Value × (Stats Score / Average Stats)
                        × Supply/Demand Factor
```

**Rarity Multipliers:**
- Common: 1x
- Rare: 2x
- Epic: 5x
- Legendary: 15x

### Resource Pricing

Resources trade freely on the marketplace. Prices determined by:
- Mining difficulty
- Production requirements  
- Player demand
- Available supply

---

## Earning Strategies

### For New Players (Low Capital)

1. **Mining Loop**
   - Mint 1 Fighter (0.001 ETH)
   - Mine resources continuously
   - Sell on marketplace
   - Reinvest in more ships

2. **Trading Arbitrage**
   - Watch marketplace for underpriced items
   - Buy low, sell high
   - Requires market knowledge

### For Established Players (Medium Capital)

3. **Station Empire**
   - Build multiple mining stations
   - Passive resource generation
   - Scale with territory control

4. **Fleet Commander**
   - Build combat fleet
   - Raid resource-rich areas
   - PvP for rewards

### For Whales (High Capital)

5. **Market Maker**
   - Provide liquidity
   - Set buy/sell walls
   - Profit from spread

6. **Legendary Hunter**
   - Mass mint for legendaries
   - Corner rare ship market
   - High risk, high reward

---

## Tokenomics Summary

| Metric | Value |
|--------|-------|
| Ship NFT Max Supply | Unlimited (demand-driven) |
| Station Max per Player | 10 |
| Resource Token Supply | Inflationary (mining) |
| Trading Fee | 2.5% |
| Treasury Allocation | 50% fees → development |

---

## Economic Governance (Future)

Planned features:
- DAO voting on fee changes
- Community treasury allocation
- Seasonal events with special rewards
- Cross-game asset portability

---

## Risk Factors

⚠️ **Important Considerations:**

1. **Testnet Assets** - Currently on Base Sepolia testnet. Assets have no real-world value.
2. **Smart Contract Risk** - Code is audited but use at your own risk.
3. **Market Volatility** - NFT and resource prices can fluctuate wildly.
4. **No Guarantees** - Game mechanics may change during development.

---

*Build your empire wisely. The galaxy rewards the strategic!*
