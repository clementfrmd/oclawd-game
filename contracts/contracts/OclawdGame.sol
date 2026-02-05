// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title OclawdGame
 * @dev Main game contract for Oclawd space strategy game
 * @notice Manages ships, stations, resources, and game mechanics
 */
contract OclawdGame is ERC721URIStorage, Ownable {
    using SafeERC20 for IERC20;

    // ========== EVENTS ==========

    event ShipMinted(address indexed player, uint256 indexed shipType, uint256 tokenId);
    event ShipTransferred(address indexed from, address indexed to, uint256 indexed tokenId);
    event StationBuilt(address indexed player, uint256 indexed stationType, uint256 tokenId);
    event ResourceMined(address indexed player, address indexed resourceType, uint256 amount);
    event ResourceTraded(address indexed from, address indexed to, address indexed resourceType, uint256 amount);
    event XPUpdated(address indexed player, uint256 xp, uint256 level);
    event GameStatsUpdated(address indexed player, uint256 score, uint256 rank);

    // ========== CONSTANTS ==========

    uint256 public constant BASE_GAS_PRICE = 20000000000; // 20 Gwei
    uint256 public constant MIN_SHIP_MINT_PRICE = 0.001 ether;
    uint256 public constant STATION_BUILD_PRICE = 0.01 ether;
    uint256 public constant MAX_SHIPS_PER_PLAYER = 100;
    uint256 public constant MAX_STATIONS_PER_PLAYER = 10;

    // ========== ENUMS ==========

    enum Rarity {
        Common,
        Rare,
        Epic,
        Legendary
    }

    enum ShipType {
        Fighter,
        Transport,
        Cruiser,
        Battleship
    }

    enum StationType {
        MiningFacility,
        Refinery,
        DockingStation,
        ResearchLab
    }

    // ========== STRUCTURES ==========

    struct PlayerStats {
        uint256 level;
        uint256 xp;
        uint256 score;
        uint256 reputation;
        uint256 miningPower;
        uint256 productionPower;
    }

    struct ShipStats {
        uint256 attackPower;
        uint256 defensePower;
        uint256 speed;
        Rarity rarity;
        uint256 fuelCapacity;
        uint256 resourceCapacity;
    }

    struct StationStats {
        uint256 miningEfficiency;
        uint256 productionRate;
        uint256 storageCapacity;
        uint256 repairCapacity;
    }

    // ========== STATE VARIABLES ==========

    IERC20 public resourceToken;

    mapping(address => PlayerStats) public playerStats;
    mapping(uint256 => ShipStats) public shipStats;
    mapping(uint256 => StationStats) public stationStats;

    mapping(address => uint256) public shipCount;
    mapping(address => uint256) public stationCount;
    mapping(uint256 => address) public shipOwner;
    mapping(uint256 => address) public stationOwner;

    mapping(uint256 => uint256) public resourcePrices;
    mapping(uint256 => uint256) public xpToNextLevel;

    uint256 private _nextTokenId;

    // ========== CONSTRUCTOR ==========

    constructor(
        string memory _name,
        string memory _symbol,
        address _resourceToken
    ) ERC721(_name, _symbol) Ownable(msg.sender) {
        resourceToken = IERC20(_resourceToken);
    }

    // ========== SHIP MANAGEMENT ==========

    /**
     * @dev Mint a new ship NFT
     * @param to The player address
     * @param shipType Type of ship to mint
     * @return tokenId The NFT token ID
     */
    function mintShip(address to, ShipType shipType) external payable returns (uint256) {
        require(msg.value >= MIN_SHIP_MINT_PRICE, "Insufficient payment");
        require(shipCount[to] < MAX_SHIPS_PER_PLAYER, "Max ships reached");

        uint256 tokenId = _nextTokenId++;
        _mint(to, tokenId);

        // Set ship type and stats based on rarity
        Rarity rarity = determineRarity(tokenId);
        shipStats[tokenId] = _generateShipStats(shipType, rarity);

        shipCount[to]++;
        shipOwner[tokenId] = to;

        emit ShipMinted(to, uint256(shipType), tokenId);

        return tokenId;
    }

    /**
     * @dev Determine ship rarity based on token ID
     * @param tokenId The NFT token ID
     * @return rarity The determined rarity level
     */
    function determineRarity(uint256 tokenId) public pure returns (Rarity) {
        uint256 hash = uint256(keccak256(abi.encodePacked(tokenId)));
        uint8 r = uint8(hash % 100);

        if (r < 70) return Rarity.Common;
        if (r < 90) return Rarity.Rare;
        if (r < 98) return Rarity.Epic;
        return Rarity.Legendary;
    }

    /**
     * @dev Generate ship stats based on type and rarity
     * @param shipType The type of ship
     * @param rarity The rarity level
     * @return stats The ship stats
     */
    function _generateShipStats(ShipType shipType, Rarity rarity) internal pure returns (ShipStats memory) {
        uint8 rarityMultiplier = uint8(rarity) + 1; // 1-4

        return ShipStats({
            attackPower: shipType == ShipType.Fighter ? 10 * rarityMultiplier : (shipType == ShipType.Cruiser ? 25 * rarityMultiplier : (shipType == ShipType.Battleship ? 50 * rarityMultiplier : 5 * rarityMultiplier)),
            defensePower: shipType == ShipType.Fighter ? 5 * rarityMultiplier : (shipType == ShipType.Cruiser ? 15 * rarityMultiplier : (shipType == ShipType.Battleship ? 30 * rarityMultiplier : 3 * rarityMultiplier)),
            speed: shipType == ShipType.Fighter ? 30 : (shipType == ShipType.Transport ? 15 : (shipType == ShipType.Cruiser ? 20 : 10)),
            rarity: rarity,
            fuelCapacity: 100 * rarityMultiplier,
            resourceCapacity: 50 * rarityMultiplier
        });
    }

    // ========== STATION MANAGEMENT ==========

    /**
     * @dev Build a new station
     * @param to The player address
     * @param stationType Type of station to build
     * @return tokenId The NFT token ID
     */
    function buildStation(address to, StationType stationType) external payable returns (uint256) {
        require(msg.value >= STATION_BUILD_PRICE, "Insufficient payment");
        require(stationCount[to] < MAX_STATIONS_PER_PLAYER, "Max stations reached");

        uint256 tokenId = _nextTokenId++;
        _mint(to, tokenId);

        // Set station type and stats
        stationStats[tokenId] = _generateStationStats(stationType);

        stationCount[to]++;
        stationOwner[tokenId] = to;

        emit StationBuilt(to, uint256(stationType), tokenId);

        return tokenId;
    }

    /**
     * @dev Generate station stats based on type
     * @param stationType The type of station
     * @return stats The station stats
     */
    function _generateStationStats(StationType stationType) internal pure returns (StationStats memory) {
        return StationStats({
            miningEfficiency: stationType == StationType.MiningFacility ? 10 : (stationType == StationType.Refinery ? 8 : (stationType == StationType.DockingStation ? 5 : 3)),
            productionRate: stationType == StationType.Refinery ? 10 : (stationType == StationType.ResearchLab ? 8 : (stationType == StationType.MiningFacility ? 5 : 3)),
            storageCapacity: stationType == StationType.MiningFacility ? 1000 : (stationType == StationType.Refinery ? 500 : 200),
            repairCapacity: 50
        });
    }

    // ========== RESOURCE MANAGEMENT ==========

    /**
     * @dev Mine resources using station
     * @param player The player address
     * @param stationTokenId The NFT token ID of the station
     */
    function mineResource(address player, uint256 stationTokenId) external {
        require(msg.sender == player, "Caller must be player");
        require(ownerOf(stationTokenId) == player, "Not station owner");
        require(playerStats[player].miningPower > 0, "No mining power");

        StationStats memory stats = stationStats[stationTokenId];
        uint256 amount = stats.miningEfficiency * playerStats[player].miningPower;

        resourceToken.safeTransferFrom(owner(), player, amount);
        playerStats[player].xp += amount / 10;

        emit ResourceMined(player, address(resourceToken), amount);
        _updateXP(player);
    }

    /**
     * @dev Trade resources between players
     * @param from The sender address
     * @param to The receiver address
     * @param amount The amount to trade
     * @param _resourceToken The resource token address
     */
    function tradeResource(
        address from,
        address to,
        uint256 amount,
        address _resourceToken
    ) external {
        require(msg.sender == from, "Caller must be sender");
        require(from != address(0) && to != address(0), "Invalid addresses");
        require(_resourceToken != address(0), "Invalid token");

        IERC20(_resourceToken).safeTransferFrom(from, to, amount);

        playerStats[from].reputation = (playerStats[from].reputation * 9999) / 10000;
        playerStats[to].reputation += 10;

        emit ResourceTraded(from, to, _resourceToken, amount);
    }

    // ========== PLAYER STATS ==========

    /**
     * @dev Update player experience and level
     * @param player The player address
     */
    function _updateXP(address player) internal {
        uint256 currentXP = playerStats[player].xp;
        uint256 level = playerStats[player].level;

        uint256 xpNeeded = xpToNextLevel[level];
        if (currentXP >= xpNeeded) {
            playerStats[player].level = level + 1;
            playerStats[player].xp = currentXP - xpNeeded;

            xpToNextLevel[level + 1] = xpNeeded * 100 / 80; // Exponential growth

            emit XPUpdated(player, playerStats[player].xp, playerStats[player].level);
        }
    }

    /**
     * @dev Update player stats
     * @param player The player address
     * @param miningPower New mining power
     * @param productionPower New production power
     */
    function updateStats(address player, uint256 miningPower, uint256 productionPower) external {
        require(msg.sender == player || msg.sender == owner(), "Not authorized");

        playerStats[player].miningPower = miningPower;
        playerStats[player].productionPower = productionPower;

        _updateXP(player);
    }

    /**
     * @dev Calculate player score for leaderboard
     * @param player The player address
     * @return score The calculated score
     */
    function calculateScore(address player) external view returns (uint256) {
        PlayerStats memory stats = playerStats[player];

        uint256 shipScore = shipCount[player] * 100;
        uint256 stationScore = stationCount[player] * 500;
        uint256 resourceScore = resourceToken.balanceOf(player) / 100;
        uint256 reputationScore = stats.reputation / 10;

        return shipScore + stationScore + resourceScore + reputationScore;
    }

    // ========== ADMIN FUNCTIONS ==========

    /**
     * @dev Set resource token address
     * @param _resourceToken The new resource token address
     */
    function setResourceToken(address _resourceToken) external onlyOwner {
        resourceToken = IERC20(_resourceToken);
    }

    /**
     * @dev Set XP needed for next level
     * @param level The level number
     * @param xpNeeded The XP required
     */
    function setXPForLevel(uint256 level, uint256 xpNeeded) external onlyOwner {
        xpToNextLevel[level] = xpNeeded;
    }

    /**
     * @dev Withdraw contract balance
     */
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @dev Get player stats
     * @param player The player address
     * @return stats The player stats
     */
    function getPlayerStats(address player) external view returns (PlayerStats memory) {
        return playerStats[player];
    }

    /**
     * @dev Get ship stats
     * @param tokenId The NFT token ID
     * @return stats The ship stats
     */
    function getShipStats(uint256 tokenId) external view returns (ShipStats memory) {
        require(ownerOf(tokenId) != address(0), "Invalid token");
        return shipStats[tokenId];
    }

    /**
     * @dev Get station stats
     * @param tokenId The NFT token ID
     * @return stats The station stats
     */
    function getStationStats(uint256 tokenId) external view returns (StationStats memory) {
        require(ownerOf(tokenId) != address(0), "Invalid token");
        return stationStats[tokenId];
    }
}
