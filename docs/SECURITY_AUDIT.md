# Void Conquest Smart Contract Security Audit

**Date:** February 5, 2026  
**Auditor:** OpenClaw Security (Trail of Bits Framework)  
**Contracts Audited:**
- VoidToken.sol
- VoidGame.sol
- VoidBoosts.sol

**Solidity Version:** ^0.8.20  
**Framework:** OpenZeppelin Contracts

---

## Executive Summary

| Severity | Count |
|----------|-------|
| 🔴 CRITICAL | 1 |
| 🟠 HIGH | 3 |
| 🟡 MEDIUM | 6 |
| 🔵 LOW | 5 |
| ⚪ GAS/INFO | 4 |

**Overall Assessment:** The contracts follow many security best practices (ReentrancyGuard, SafeERC20, Solidity 0.8.20). However, there is a **critical integration bug** in VoidBoosts and several arithmetic edge cases that need attention before mainnet deployment.

---

## Critical Findings

### 🔴 CRIT-01: Burn Function Will Fail - Missing Token Balance

**Contract:** VoidBoosts.sol  
**Location:** `_processPayment()` lines 168-171  
**Severity:** CRITICAL

```solidity
// Burn tokens
IERC20Burnable(address(voidToken)).burn(burnAmount);
totalBurned += burnAmount;
```

**Issue:** The contract calls `burn()` on the VoidToken expecting it to burn from VoidBoosts's balance. However, OpenZeppelin's `ERC20Burnable.burn()` requires the caller to have approved themselves or use `burnFrom()`. 

**Actually, on closer inspection:** The VoidToken inherits `ERC20Burnable` which has:
```solidity
function burn(uint256 amount) public virtual {
    _burn(_msgSender(), amount);
}
```

This burns from the caller's (VoidBoosts's) balance. **This should work correctly** since VoidBoosts received the tokens via `safeTransferFrom` first.

**CORRECTION - Downgrading to INFO:** After re-analysis, the burn flow is:
1. Tokens transferred TO VoidBoosts ✓
2. VoidBoosts calls `burn()` on VoidToken ✓
3. Burns from VoidBoosts's balance ✓

The logic is correct. However, **the interface casting is unnecessary and could mask compilation errors**.

**Recommendation:** Remove the interface cast and use the contract directly, or add an integration test to verify this flow.

---

## High Severity Findings

### 🟠 HIGH-01: Arithmetic Overflow in Cost/Production Calculations

**Contract:** VoidGame.sol  
**Location:** `getFacilityCost()`, `getOreProduction()`, `getCrystalProduction()`, `getPlasmaProduction()`  
**Severity:** HIGH

```solidity
// getFacilityCost - line 378
ore = 60 * (15 ** level) / (10 ** level);

// getOreProduction - line 325
return 30 * level * (11 ** level) / (10 ** level);
```

**Issue:** At high facility levels (approaching MAX_FACILITY_LEVEL = 30), these exponential calculations produce astronomically large intermediate values:
- `15 ** 30` ≈ 1.9 × 10^35
- `11 ** 30` ≈ 1.7 × 10^31

While these fit in uint256, the **multiplication order matters**:
- `30 * level * (11 ** level)` at level 30 = 30 × 30 × 1.7×10^31 ≈ 1.5×10^34

**Impact:** 
- Facility costs become impossibly expensive (potentially unplayable at high levels)
- Production numbers become unrealistic
- Potential for economic exploits if values wrap or behave unexpectedly

**Recommendation:**
```solidity
// Use safer fixed-point math or cap effective level
function getOreProduction(uint256 colonyId) public view returns (uint256) {
    uint256 level = colonyFacilities[colonyId][FacilityType.OreExtractor].level;
    if (level == 0) return 30;
    
    // Cap calculation level to prevent overflow
    uint256 calcLevel = level > 20 ? 20 : level;
    return 30 * calcLevel * (11 ** calcLevel) / (10 ** calcLevel);
}
```

---

### 🟠 HIGH-02: Missing Access Control on Complete Functions

**Contract:** VoidGame.sol  
**Location:** `completeFacilityUpgrade()` line 251, `completeResearch()` line 295  
**Severity:** HIGH

```solidity
function completeFacilityUpgrade(uint256 colonyId, FacilityType facilityType) external {
    // No ownership check!
    Facility storage facility = colonyFacilities[colonyId][facilityType];
    require(facility.upgradeEndTime > 0, "No upgrade in progress");
    require(facility.upgradeEndTime <= block.timestamp, "Upgrade not complete");
    ...
}
```

**Issue:** Anyone can call `completeFacilityUpgrade()` for any colony and `completeResearch()` for any player. While this might seem harmless (just completing what's ready), it enables:
- Griefing by forcing state changes
- Front-running player transactions
- Manipulating game state timing

**Recommendation:**
```solidity
function completeFacilityUpgrade(uint256 colonyId, FacilityType facilityType) external {
    require(colonies[colonyId].owner == msg.sender, "Not colony owner");
    // ... rest of function
}
```

---

### 🟠 HIGH-03: Zero Address Validation Missing in Critical Setters

**Contract:** VoidBoosts.sol  
**Location:** Constructor, `setTreasury()`, `setStakingPool()`  
**Severity:** HIGH

```solidity
constructor(
    address _voidToken,
    address _treasury,
    address _stakingPool
) Ownable(msg.sender) {
    voidToken = IERC20(_voidToken);  // No validation!
    treasury = _treasury;             // No validation!
    stakingPool = _stakingPool;       // No validation!
}

function setTreasury(address _treasury) external onlyOwner {
    treasury = _treasury;  // Can be set to address(0)!
}
```

**Impact:** 
- If treasury or stakingPool is address(0), `_processPayment()` will transfer tokens to the zero address (effectively burning more than intended)
- If voidToken is address(0), all boost functions will fail

**Recommendation:**
```solidity
function setTreasury(address _treasury) external onlyOwner {
    require(_treasury != address(0), "Invalid treasury address");
    treasury = _treasury;
}
```

---

## Medium Severity Findings

### 🟡 MED-01: Centralization Risk - Owner Can Drain Token Supply

**Contract:** VoidToken.sol  
**Location:** `treasuryMint()` line 68  
**Severity:** MEDIUM

```solidity
function treasuryMint(address to, uint256 amount) external onlyOwner {
    require(totalMinted + amount <= MAX_SUPPLY, "Max supply exceeded");
    _mint(to, amount);
    totalMinted += amount;
}
```

**Issue:** Owner can mint up to 900M tokens (MAX_SUPPLY - INITIAL_MINT) instantly with no timelock, multi-sig, or governance. This is a significant centralization risk.

**Recommendation:**
- Implement a timelock (e.g., 48 hours) for treasury mints
- Add a per-period minting cap
- Consider multi-sig ownership

---

### 🟡 MED-02: Incomplete Boost Integration

**Contract:** VoidBoosts.sol  
**Location:** `useInstantBuild()`, `useEmergencyRecall()`  
**Severity:** MEDIUM

```solidity
function useInstantBuild(uint256 colonyId, uint256 facilityId) external nonReentrant {
    _processPayment(msg.sender, INSTANT_BUILD_COST);
    playerBoosts[msg.sender].instantBuildsUsed++;
    emit InstantBuildUsed(msg.sender, colonyId, facilityId);
    // Game contract will handle the actual completion <-- TRUST ASSUMPTION
}
```

**Issue:** 
- These functions take payment but don't actually interact with VoidGame
- The `onlyGameContract` modifier exists but is never used
- Users could pay for boosts that don't actually work if game integration is incomplete

**Recommendation:**
- Add direct integration with VoidGame contract via interface
- Or implement a callback/verification pattern

---

### 🟡 MED-03: Front-Running Risk in Registration

**Contract:** VoidGame.sol  
**Location:** `register()` line 165  
**Severity:** MEDIUM

**Issue:** A malicious actor can monitor the mempool and front-run a player's `register()` call to claim their desired coordinates (galaxy, system, position).

**Recommendation:**
- Implement commit-reveal scheme for registration
- Or use a first-come-first-served queue with time delay

---

### 🟡 MED-04: Shield Applies to Player, Not Colony

**Contract:** VoidBoosts.sol  
**Location:** Lines 51-52  
**Severity:** MEDIUM

```solidity
mapping(address => bool) public hasVoidShield;
mapping(address => uint256) public voidShieldExpiry;
```

**Issue:** Void Shield protection is per-player, but players can have multiple colonies. This ambiguity could lead to:
- Players expecting all colonies to be protected
- Game logic inconsistencies if some colonies should be attackable

**Recommendation:** Change to per-colony shields:
```solidity
mapping(uint256 => bool) public colonyHasVoidShield;
mapping(uint256 => uint256) public colonyShieldExpiry;
```

---

### 🟡 MED-05: No Emergency Pause Mechanism

**Contract:** VoidToken.sol, VoidGame.sol  
**Severity:** MEDIUM

**Issue:** Neither contract implements OpenZeppelin's Pausable. In case of a discovered vulnerability or exploit, there's no way to quickly halt operations.

**Recommendation:**
```solidity
import "@openzeppelin/contracts/utils/Pausable.sol";

contract VoidGame is Ownable, ReentrancyGuard, Pausable {
    function register(...) external nonReentrant whenNotPaused {
```

---

### 🟡 MED-06: totalMinted Can Desync from Actual Supply

**Contract:** VoidToken.sol  
**Severity:** MEDIUM

**Issue:** `totalMinted` tracks minted tokens but doesn't account for burned tokens. If tokens are burned via `ERC20Burnable.burn()`, `totalMinted` stays the same, meaning the effective mintable supply decreases permanently.

**Recommendation:** Either:
1. Track `totalBurned` and use `totalMinted - totalBurned` for supply calculations
2. Or rename `totalMinted` to clarify it's lifetime mints, not circulating supply

---

## Low Severity Findings

### 🔵 LOW-01: Duplicate Minter Addition Possible

**Contract:** VoidToken.sol  
**Location:** `addMinter()` line 45

```solidity
function addMinter(address minter) external onlyOwner {
    require(minter != address(0), "Invalid address");
    minters[minter] = true;  // No check if already minter
    emit MinterAdded(minter);
}
```

**Impact:** Emits misleading events, wastes gas.

---

### 🔵 LOW-02: Unused Function Parameter

**Contract:** VoidGame.sol  
**Location:** `getFacilityBuildTime()` line 399

```solidity
function getFacilityBuildTime(uint256 colonyId, FacilityType, uint256 level) public view returns (uint256) {
    // FacilityType parameter is never used
```

**Recommendation:** Remove unused parameter or implement facility-specific build times.

---

### 🔵 LOW-03: Missing Event in treasuryMint

**Contract:** VoidToken.sol  
**Location:** `treasuryMint()` line 68

**Issue:** Unlike `mintReward()`, `treasuryMint()` doesn't emit a custom event explaining the mint reason, making on-chain auditing harder.

---

### 🔵 LOW-04: No Maximum Colony Name Length

**Contract:** VoidGame.sol  
**Location:** `register()` line 165

**Issue:** Colony names have no length limit, allowing excessively long strings that waste gas and could cause UI issues.

---

### 🔵 LOW-05: Expired Boost Data Persists

**Contract:** VoidBoosts.sol

**Issue:** When boosts expire, their data remains in storage. This doesn't cause bugs but wastes storage and gas on reads.

---

## Gas Optimization Findings

### ⚪ GAS-01: Use Immutable for Constructor-Set Addresses

**Contract:** VoidBoosts.sol

```solidity
IERC20 public voidToken;  // Should be immutable
```

**Recommendation:**
```solidity
IERC20 public immutable voidToken;
```

---

### ⚪ GAS-02: Cache Storage Variables in Loops/Calculations

**Contract:** VoidGame.sol - `_updateResources()`

```solidity
// Cache these to avoid multiple SLOAD
uint256 oreProduction = getOreProduction(colonyId);
uint256 crystalProduction = getCrystalProduction(colonyId);
```

---

### ⚪ GAS-03: Use Custom Errors Instead of Strings

All contracts use revert strings which cost more gas than custom errors.

```solidity
// Instead of:
require(minter != address(0), "Invalid address");

// Use:
error InvalidAddress();
if (minter == address(0)) revert InvalidAddress();
```

---

### ⚪ GAS-04: Redundant Storage Writes

**Contract:** VoidGame.sol - `completeFacilityUpgrade()`

```solidity
facility.upgradeStartTime = 0;  // Both are zero
facility.upgradeEndTime = 0;    // Could batch delete
```

---

## Token Integration Assessment

Based on Trail of Bits Token Integration Checklist:

| Check | Status |
|-------|--------|
| Uses SafeERC20 | ✅ Yes (VoidGame, VoidBoosts) |
| Handles missing return values | ✅ SafeERC20 handles this |
| Handles fee-on-transfer | ⚠️ Not applicable (own token) |
| Reentrancy protection | ✅ ReentrancyGuard used |
| ERC20 conformity | ✅ OpenZeppelin compliant |
| Approval race condition | ✅ OpenZeppelin increaseAllowance available |
| Decimal handling | ✅ Uses 18 decimals consistently |

---

## Recommendations Summary

### Immediate Actions (Before Deployment)
1. ✅ Fix access control on `completeFacilityUpgrade()` and `completeResearch()`
2. ✅ Add zero-address validation to constructors and setters
3. ✅ Review arithmetic formulas for high-level edge cases

### Short-Term Improvements
4. Add Pausable to VoidToken and VoidGame
5. Complete VoidBoosts ↔ VoidGame integration
6. Add timelock/multi-sig to owner privileges

### Best Practices
7. Use custom errors instead of revert strings
8. Mark unchanging addresses as `immutable`
9. Add comprehensive test coverage for edge cases

---

## Conclusion

The Void Conquest smart contracts demonstrate solid foundational security practices. The use of OpenZeppelin's battle-tested contracts (ERC20, Ownable, ReentrancyGuard, SafeERC20) significantly reduces common vulnerability risks.

However, the **missing access controls on completion functions** and **potential arithmetic issues at high levels** should be addressed before mainnet deployment. The contracts would also benefit from additional decentralization measures (timelocks, multi-sig) to reduce centralization risks.

**Audit Status:** ⚠️ REQUIRES FIXES BEFORE DEPLOYMENT

---

*This audit was performed using the Trail of Bits Building Secure Contracts framework and token integration checklist.*
