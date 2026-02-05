// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title OclawdNFT
 * @dev Specialized NFT contract for Oclawd fleet ships
 * @notice ERC721 implementation for unique fleet ships
 */
contract OclawdNFT is ERC721URIStorage, Ownable {
    // ========== EVENTS ==========

    event ShipMinted(
        address indexed player,
        uint256 indexed shipType,
        uint256 indexed tokenId,
        Rarity rarity
    );

    event ShipUpgraded(uint256 indexed tokenId, Rarity newRarity, uint256 upgradeCost);
    event ShipMetadataUpdated(uint256 indexed tokenId, string metadataURI);

    // ========== ENUMS ==========

    enum Rarity {
        Common,
        Rare,
        Epic,
        Legendary
    }

    // ========== STRUCTURES ==========

    struct ShipData {
        Rarity rarity;
        uint8 attackPower;
        uint8 defensePower;
        uint8 speed;
        uint16 fuelCapacity;
        uint16 resourceCapacity;
        uint256 lastUpdated;
    }

    // ========== STATE VARIABLES ==========

    mapping(uint256 => ShipData) public ships;
    mapping(uint256 => uint256) public mintingCosts;
    mapping(Rarity => uint256) public baseMintingCosts;

    uint256 public nextTokenId = 0;

    // ========== CONSTANTS ==========

    uint256 public constant LEGENDARY_COST = 0.1 ether;
    uint256 public constant EPIC_COST = 0.05 ether;
    uint256 public constant RARE_COST = 0.02 ether;
    uint256 public constant COMMON_COST = 0.001 ether;

    // ========== CONSTRUCTOR ==========

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) Ownable(msg.sender) {}

    // ========== MINTING ==========

    /**
     * @dev Mint a new ship NFT
     * @param to The player address
     * @param shipType The type of ship
     * @return tokenId The NFT token ID
     */
    function mintShip(address to, uint256 shipType) external payable returns (uint256) {
        uint256 cost = _getMintingCost(shipType);
        require(msg.value >= cost, "Insufficient payment");

        uint256 tokenId = ++nextTokenId;
        _mint(to, tokenId);

        // Generate random rarity
        Rarity rarity = _determineRarity(tokenId);

        // Set minting cost based on rarity
        mintingCosts[tokenId] = cost;

        // Set ship data
        ships[tokenId] = ShipData({
            rarity: rarity,
            attackPower: 0,
            defensePower: 0,
            speed: 0,
            fuelCapacity: 0,
            resourceCapacity: 0,
            lastUpdated: block.timestamp
        });

        emit ShipMinted(to, shipType, tokenId, rarity);

        // Transfer payment to owner
        payable(owner()).transfer(cost);

        return tokenId;
    }

    /**
     * @dev Determine ship rarity based on token ID
     * @param tokenId The NFT token ID
     * @return rarity The determined rarity level
     */
    function _determineRarity(uint256 tokenId) internal pure returns (Rarity) {
        uint256 hash = uint256(keccak256(abi.encodePacked(tokenId)));
        uint8 r = uint8(hash % 100);

        if (r < 70) return Rarity.Common;
        if (r < 90) return Rarity.Rare;
        if (r < 98) return Rarity.Epic;
        return Rarity.Legendary;
    }

    /**
     * @dev Get minting cost based on ship type
     * @param shipType The ship type
     * @return cost The minting cost
     */
    function _getMintingCost(uint256 shipType) internal view returns (uint256) {
        return baseMintingCosts[shipType] * 100 / 100; // Base cost
    }

    // ========== UPGRADES ==========

    /**
     * @dev Upgrade ship rarity
     * @param tokenId The NFT token ID
     * @return newCost The new minting cost
     */
    function upgradeShip(uint256 tokenId) external payable returns (uint256) {
        ShipData memory data = ships[tokenId];
        require(ownerOf(tokenId) == msg.sender, "Not owner");

        Rarity newRarity;
        uint256 cost;
        if (data.rarity == Rarity.Common) {
            newRarity = Rarity.Rare;
            cost = RARE_COST;
        } else if (data.rarity == Rarity.Rare) {
            newRarity = Rarity.Epic;
            cost = EPIC_COST;
        } else if (data.rarity == Rarity.Epic) {
            newRarity = Rarity.Legendary;
            cost = LEGENDARY_COST;
        } else {
            revert("Max rarity reached");
        }

        require(msg.value >= cost, "Insufficient payment");

        ships[tokenId].rarity = newRarity;
        mintingCosts[tokenId] = cost;
        ships[tokenId].lastUpdated = block.timestamp;

        emit ShipUpgraded(tokenId, newRarity, cost);

        payable(owner()).transfer(cost);

        return cost;
    }

    // ========== METADATA ==========

    /**
     * @dev Update ship metadata URI
     * @param tokenId The NFT token ID
     * @param uri The new metadata URI
     */
    function setShipURI(uint256 tokenId, string memory uri) external onlyOwner {
        _setTokenURI(tokenId, uri);

        emit ShipMetadataUpdated(tokenId, uri);
    }

    /**
     * @dev Batch set metadata URIs
     * @param tokenIds The NFT token IDs
     * @param uris The metadata URIs
     */
    function batchSetShipURI(uint256[] calldata tokenIds, string[] calldata uris) external onlyOwner {
        require(tokenIds.length == uris.length, "Mismatched arrays");

        for (uint256 i = 0; i < tokenIds.length; i++) {
            _setTokenURI(tokenIds[i], uris[i]);
            emit ShipMetadataUpdated(tokenIds[i], uris[i]);
        }
    }

    // ========== ADMIN FUNCTIONS ==========

    /**
     * @dev Set base minting costs for each rarity
     * @param cost The cost multiplier
     */
    function setBaseMintingCosts(uint256 cost) external onlyOwner {
        baseMintingCosts[Rarity.Common] = COMMON_COST;
        baseMintingCosts[Rarity.Rare] = RARE_COST;
        baseMintingCosts[Rarity.Epic] = EPIC_COST;
        baseMintingCosts[Rarity.Legendary] = LEGENDARY_COST;
    }

    /**
     * @dev Update ship stats
     * @param tokenId The NFT token ID
     * @param attackPower Attack power
     * @param defensePower Defense power
     * @param speed Speed
     * @param fuelCapacity Fuel capacity
     * @param resourceCapacity Resource capacity
     */
    function updateShipStats(
        uint256 tokenId,
        uint8 attackPower,
        uint8 defensePower,
        uint8 speed,
        uint16 fuelCapacity,
        uint16 resourceCapacity
    ) external onlyOwner {
        ships[tokenId].attackPower = attackPower;
        ships[tokenId].defensePower = defensePower;
        ships[tokenId].speed = speed;
        ships[tokenId].fuelCapacity = fuelCapacity;
        ships[tokenId].resourceCapacity = resourceCapacity;
        ships[tokenId].lastUpdated = block.timestamp;
    }

    /**
     * @dev Update all stats for a ship type
     * @param shipType The ship type (0: Fighter, 1: Transport, 2: Cruiser, 3: Battleship)
     * @param attackPower Base attack power
     * @param defensePower Base defense power
     * @param speed Base speed
     */
    function setShipTypeStats(
        uint8 shipType,
        uint8 attackPower,
        uint8 defensePower,
        uint8 speed
    ) external onlyOwner {
        for (uint256 tokenId = 1; tokenId <= nextTokenId; tokenId++) {
            if (ships[tokenId].rarity != Rarity.Legendary) {
                uint8 rarityMultiplier = uint8(ships[tokenId].rarity) + 1;
                ships[tokenId].attackPower = attackPower * rarityMultiplier;
                ships[tokenId].defensePower = defensePower * rarityMultiplier;
                ships[tokenId].speed = speed;
            }
        }
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @dev Get ship data
     * @param tokenId The NFT token ID
     * @return data The ship data
     */
    function getShipData(uint256 tokenId) external view returns (ShipData memory) {
        require(ownerOf(tokenId) != address(0), "Invalid token");
        return ships[tokenId];
    }

    /**
     * @dev Get rarity string
     * @param rarity The rarity enum
     * @return string The rarity name
     */
    function getRarityString(Rarity rarity) external pure returns (string memory) {
        if (rarity == Rarity.Common) return "Common";
        if (rarity == Rarity.Rare) return "Rare";
        if (rarity == Rarity.Epic) return "Epic";
        return "Legendary";
    }

    /**
     * @dev Get rarity color code
     * @param rarity The rarity enum
     * @return color The color code
     */
    function getRarityColor(Rarity rarity) external pure returns (string memory) {
        if (rarity == Rarity.Common) return "#9ca3af";
        if (rarity == Rarity.Rare) return "#3b82f6";
        if (rarity == Rarity.Epic) return "#a855f7";
        return "#eab308";
    }
}
