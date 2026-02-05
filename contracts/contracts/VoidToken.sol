// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VoidToken
 * @dev $VOID token for Void Conquest game economy
 * @notice Used for boosts, protection shields, staking rewards
 */
contract VoidToken is ERC20, ERC20Burnable, Ownable {
    
    // ========== CONSTANTS ==========
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion
    uint256 public constant INITIAL_MINT = 100_000_000 * 10**18; // 100 million for treasury
    
    // ========== STATE ==========
    mapping(address => bool) public minters; // Game contracts that can mint rewards
    uint256 public totalMinted;
    
    // ========== EVENTS ==========
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event RewardMinted(address indexed to, uint256 amount, string reason);
    
    // ========== CONSTRUCTOR ==========
    constructor() ERC20("Void Token", "VOID") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_MINT);
        totalMinted = INITIAL_MINT;
    }
    
    // ========== MINTER MANAGEMENT ==========
    
    /**
     * @dev Add a minter (game contract)
     */
    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "Invalid address");
        minters[minter] = true;
        emit MinterAdded(minter);
    }
    
    /**
     * @dev Remove a minter
     */
    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    // ========== MINTING ==========
    
    /**
     * @dev Mint reward tokens (only by authorized game contracts)
     */
    function mintReward(address to, uint256 amount, string calldata reason) external {
        require(minters[msg.sender], "Not authorized minter");
        require(totalMinted + amount <= MAX_SUPPLY, "Max supply exceeded");
        
        _mint(to, amount);
        totalMinted += amount;
        
        emit RewardMinted(to, amount, reason);
    }
    
    /**
     * @dev Owner mint for treasury operations
     */
    function treasuryMint(address to, uint256 amount) external onlyOwner {
        require(totalMinted + amount <= MAX_SUPPLY, "Max supply exceeded");
        
        _mint(to, amount);
        totalMinted += amount;
    }
    
    // ========== VIEW ==========
    
    function remainingMintable() external view returns (uint256) {
        return MAX_SUPPLY - totalMinted;
    }
}
