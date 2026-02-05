// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title VoidGame
 * @dev Main game contract for Void Conquest
 * @notice Manages colonies, facilities, research, and game state
 */
contract VoidGame is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // ========== CONSTANTS ==========
    
    uint256 public constant MAX_COLONIES_BASE = 1;
    uint256 public constant MAX_FACILITIES = 22;
    uint256 public constant MAX_FACILITY_LEVEL = 30;
    uint256 public constant GAME_TICK_INTERVAL = 10 minutes;
    
    // ========== ENUMS ==========
    
    enum FacilityType {
        // Resource Extraction (0-4)
        OreExtractor,
        CrystalHarvester,
        PlasmaCollector,
        SolarArray,
        QuantumReactor,
        // Storage (5-7)
        OreVault,
        CrystalSilo,
        PlasmaTank,
        // Manufacturing (8-12)
        AssemblyPlant,
        Starport,
        ScienceAcademy,
        Nanoforge,
        AtmosphereProcessor,
        // Military (13-17)
        CoalitionHub,
        OrdnanceDepot,
        RepairBay,
        DeepScanner,
        WarpGate,
        // Special (18-21)
        OrbitalPlatform,
        BarrierFieldMk1,
        BarrierFieldMk2
    }
    
    enum ResearchType {
        // Foundation (0-4)
        QuantumDynamics,
        PhotonScience,
        ParticlePhysics,
        DimensionalTheory,
        FusionTech,
        // Propulsion (5-7)
        ChemicalPropulsion,
        IonDrive,
        WarpDrive,
        // Military (8-10)
        WeaponsSystems,
        ShieldMatrix,
        HullReinforcement,
        // Advanced (11-17)
        CovertOperations,
        NeuralNetworks,
        StellarCartography,
        QuantumEntanglement,
        SingularityTech
    }
    
    enum VesselType {
        // Combat (0-7)
        ScoutFighter,
        AssaultFighter,
        StrikeCruiser,
        Dreadnought,
        Vanguard,
        SiegeBomber,
        Annihilator,
        Titan,
        // Support (8-13)
        Courier,
        Freighter,
        Pioneer,
        Salvager,
        ShadowProbe,
        SolarHarvester,
        // Expedition (14)
        Voidrunner
    }
    
    // ========== STRUCTS ==========
    
    struct Colony {
        uint256 id;
        address owner;
        string name;
        uint256 galaxy;
        uint256 system;
        uint256 position;
        uint256 fields;           // Total buildable slots
        uint256 fieldsUsed;       // Slots used by facilities
        uint256 createdAt;
    }
    
    struct Resources {
        uint256 ore;
        uint256 crystal;
        uint256 plasma;
        uint256 energy;
        uint256 lastUpdate;
    }
    
    struct Facility {
        FacilityType facilityType;
        uint256 level;
        uint256 upgradeStartTime;
        uint256 upgradeEndTime;
    }
    
    struct Research {
        ResearchType researchType;
        uint256 level;
        uint256 startTime;
        uint256 endTime;
    }
    
    struct Fleet {
        uint256 id;
        address owner;
        uint256 originColonyId;
        uint256 targetColonyId;
        uint256 departureTime;
        uint256 arrivalTime;
        uint256 missionType; // 0=attack, 1=transport, 2=deploy, 3=espionage, 4=colonize
        bool isReturning;
    }
    
    struct PlayerStats {
        uint256 totalColonies;
        uint256 totalFleetPower;
        uint256 totalResearchPoints;
        uint256 combatWins;
        uint256 combatLosses;
        uint256 registeredAt;
        bool isActive;
    }
    
    // ========== STATE ==========
    
    IERC20 public voidToken;
    address public boostsContract;
    
    uint256 public nextColonyId = 1;
    uint256 public nextFleetId = 1;
    uint256 public totalPlayers;
    uint256 public lastGameTick;
    
    // Player data
    mapping(address => PlayerStats) public players;
    mapping(address => uint256[]) public playerColonies;
    mapping(address => mapping(ResearchType => uint256)) public playerResearch;
    mapping(address => Research) public activeResearch;
    
    // Colony data
    mapping(uint256 => Colony) public colonies;
    mapping(uint256 => Resources) public colonyResources;
    mapping(uint256 => mapping(FacilityType => Facility)) public colonyFacilities;
    mapping(uint256 => mapping(VesselType => uint256)) public colonyVessels;
    
    // Fleet data
    mapping(uint256 => Fleet) public fleets;
    mapping(uint256 => mapping(VesselType => uint256)) public fleetComposition;
    
    // Universe
    mapping(uint256 => mapping(uint256 => mapping(uint256 => uint256))) public universeMap; // galaxy => system => position => colonyId
    
    // ========== EVENTS ==========
    
    event PlayerRegistered(address indexed player, uint256 timestamp);
    event ColonyCreated(address indexed player, uint256 indexed colonyId, uint256 galaxy, uint256 system, uint256 position);
    event FacilityUpgradeStarted(uint256 indexed colonyId, FacilityType facilityType, uint256 newLevel, uint256 completionTime);
    event FacilityUpgradeCompleted(uint256 indexed colonyId, FacilityType facilityType, uint256 level);
    event ResearchStarted(address indexed player, ResearchType researchType, uint256 level, uint256 completionTime);
    event ResearchCompleted(address indexed player, ResearchType researchType, uint256 level);
    event VesselBuilt(uint256 indexed colonyId, VesselType vesselType, uint256 quantity);
    event FleetDispatched(uint256 indexed fleetId, address indexed owner, uint256 originId, uint256 targetId, uint256 arrivalTime);
    event CombatResolved(uint256 indexed fleetId, uint256 indexed targetColonyId, bool attackerWon);
    event ResourcesUpdated(uint256 indexed colonyId, uint256 ore, uint256 crystal, uint256 plasma);
    
    // ========== CONSTRUCTOR ==========
    
    constructor(address _voidToken) Ownable(msg.sender) {
        voidToken = IERC20(_voidToken);
        lastGameTick = block.timestamp;
    }
    
    // ========== PLAYER REGISTRATION ==========
    
    /**
     * @dev Register as a new player and create homeworld
     */
    function register(string calldata colonyName, uint256 galaxy, uint256 system, uint256 position) external nonReentrant {
        require(!players[msg.sender].isActive, "Already registered");
        require(galaxy >= 1 && galaxy <= 9, "Invalid galaxy");
        require(system >= 1 && system <= 499, "Invalid system");
        require(position >= 1 && position <= 15, "Invalid position");
        require(universeMap[galaxy][system][position] == 0, "Position occupied");
        
        // Register player
        players[msg.sender] = PlayerStats({
            totalColonies: 1,
            totalFleetPower: 0,
            totalResearchPoints: 0,
            combatWins: 0,
            combatLosses: 0,
            registeredAt: block.timestamp,
            isActive: true
        });
        totalPlayers++;
        
        // Create homeworld
        uint256 colonyId = nextColonyId++;
        colonies[colonyId] = Colony({
            id: colonyId,
            owner: msg.sender,
            name: colonyName,
            galaxy: galaxy,
            system: system,
            position: position,
            fields: 163, // Standard planet size
            fieldsUsed: 0,
            createdAt: block.timestamp
        });
        
        playerColonies[msg.sender].push(colonyId);
        universeMap[galaxy][system][position] = colonyId;
        
        // Initialize resources
        colonyResources[colonyId] = Resources({
            ore: 500,
            crystal: 500,
            plasma: 0,
            energy: 0,
            lastUpdate: block.timestamp
        });
        
        emit PlayerRegistered(msg.sender, block.timestamp);
        emit ColonyCreated(msg.sender, colonyId, galaxy, system, position);
    }
    
    // ========== FACILITY MANAGEMENT ==========
    
    /**
     * @dev Start facility upgrade
     */
    function upgradeFacility(uint256 colonyId, FacilityType facilityType) external nonReentrant {
        Colony storage colony = colonies[colonyId];
        require(colony.owner == msg.sender, "Not colony owner");
        
        Facility storage facility = colonyFacilities[colonyId][facilityType];
        require(facility.upgradeEndTime == 0 || facility.upgradeEndTime <= block.timestamp, "Upgrade in progress");
        
        uint256 newLevel = facility.level + 1;
        require(newLevel <= MAX_FACILITY_LEVEL, "Max level reached");
        
        // Calculate costs
        (uint256 oreCost, uint256 crystalCost, uint256 plasmaCost) = getFacilityCost(facilityType, newLevel);
        
        // Check and deduct resources
        Resources storage res = colonyResources[colonyId];
        _updateResources(colonyId); // Update resources first
        require(res.ore >= oreCost, "Insufficient ore");
        require(res.crystal >= crystalCost, "Insufficient crystal");
        require(res.plasma >= plasmaCost, "Insufficient plasma");
        
        res.ore -= oreCost;
        res.crystal -= crystalCost;
        res.plasma -= plasmaCost;
        
        // Calculate build time
        uint256 buildTime = getFacilityBuildTime(colonyId, facilityType, newLevel);
        
        facility.facilityType = facilityType;
        facility.upgradeStartTime = block.timestamp;
        facility.upgradeEndTime = block.timestamp + buildTime;
        
        emit FacilityUpgradeStarted(colonyId, facilityType, newLevel, facility.upgradeEndTime);
    }
    
    /**
     * @dev Complete facility upgrade (called by game tick or manually)
     */
    function completeFacilityUpgrade(uint256 colonyId, FacilityType facilityType) external {
        Facility storage facility = colonyFacilities[colonyId][facilityType];
        require(facility.upgradeEndTime > 0, "No upgrade in progress");
        require(facility.upgradeEndTime <= block.timestamp, "Upgrade not complete");
        
        facility.level++;
        facility.upgradeStartTime = 0;
        facility.upgradeEndTime = 0;
        
        // Update fields used
        colonies[colonyId].fieldsUsed++;
        
        emit FacilityUpgradeCompleted(colonyId, facilityType, facility.level);
    }
    
    // ========== RESEARCH ==========
    
    /**
     * @dev Start research
     */
    function startResearch(uint256 colonyId, ResearchType researchType) external nonReentrant {
        require(colonies[colonyId].owner == msg.sender, "Not colony owner");
        require(activeResearch[msg.sender].endTime == 0 || activeResearch[msg.sender].endTime <= block.timestamp, "Research in progress");
        
        // Check Science Academy level
        require(colonyFacilities[colonyId][FacilityType.ScienceAcademy].level >= 1, "Need Science Academy");
        
        uint256 currentLevel = playerResearch[msg.sender][researchType];
        uint256 newLevel = currentLevel + 1;
        
        // Calculate costs
        (uint256 oreCost, uint256 crystalCost, uint256 plasmaCost) = getResearchCost(researchType, newLevel);
        
        // Check and deduct resources
        Resources storage res = colonyResources[colonyId];
        _updateResources(colonyId);
        require(res.ore >= oreCost, "Insufficient ore");
        require(res.crystal >= crystalCost, "Insufficient crystal");
        require(res.plasma >= plasmaCost, "Insufficient plasma");
        
        res.ore -= oreCost;
        res.crystal -= crystalCost;
        res.plasma -= plasmaCost;
        
        // Calculate research time
        uint256 researchTime = getResearchTime(colonyId, researchType, newLevel);
        
        activeResearch[msg.sender] = Research({
            researchType: researchType,
            level: newLevel,
            startTime: block.timestamp,
            endTime: block.timestamp + researchTime
        });
        
        emit ResearchStarted(msg.sender, researchType, newLevel, activeResearch[msg.sender].endTime);
    }
    
    /**
     * @dev Complete research
     */
    function completeResearch() external {
        Research storage research = activeResearch[msg.sender];
        require(research.endTime > 0, "No research in progress");
        require(research.endTime <= block.timestamp, "Research not complete");
        
        playerResearch[msg.sender][research.researchType] = research.level;
        players[msg.sender].totalResearchPoints += research.level * 100;
        
        emit ResearchCompleted(msg.sender, research.researchType, research.level);
        
        delete activeResearch[msg.sender];
    }
    
    // ========== RESOURCE MANAGEMENT ==========
    
    /**
     * @dev Update colony resources based on production
     */
    function _updateResources(uint256 colonyId) internal {
        Resources storage res = colonyResources[colonyId];
        uint256 timePassed = block.timestamp - res.lastUpdate;
        
        if (timePassed == 0) return;
        
        // Calculate production per hour
        uint256 oreProduction = getOreProduction(colonyId);
        uint256 crystalProduction = getCrystalProduction(colonyId);
        uint256 plasmaProduction = getPlasmaProduction(colonyId);
        
        // Update resources
        res.ore += (oreProduction * timePassed) / 1 hours;
        res.crystal += (crystalProduction * timePassed) / 1 hours;
        res.plasma += (plasmaProduction * timePassed) / 1 hours;
        res.lastUpdate = block.timestamp;
        
        emit ResourcesUpdated(colonyId, res.ore, res.crystal, res.plasma);
    }
    
    /**
     * @dev Get ore production per hour
     */
    function getOreProduction(uint256 colonyId) public view returns (uint256) {
        uint256 level = colonyFacilities[colonyId][FacilityType.OreExtractor].level;
        if (level == 0) return 30; // Base production
        return 30 * level * (11 ** level) / (10 ** level);
    }
    
    /**
     * @dev Get crystal production per hour
     */
    function getCrystalProduction(uint256 colonyId) public view returns (uint256) {
        uint256 level = colonyFacilities[colonyId][FacilityType.CrystalHarvester].level;
        if (level == 0) return 15; // Base production
        return 20 * level * (11 ** level) / (10 ** level);
    }
    
    /**
     * @dev Get plasma production per hour
     */
    function getPlasmaProduction(uint256 colonyId) public view returns (uint256) {
        uint256 level = colonyFacilities[colonyId][FacilityType.PlasmaCollector].level;
        if (level == 0) return 0;
        return 10 * level * (11 ** level) / (10 ** level);
    }
    
    // ========== COST CALCULATIONS ==========
    
    function getFacilityCost(FacilityType facilityType, uint256 level) public pure returns (uint256 ore, uint256 crystal, uint256 plasma) {
        // Base costs vary by facility type
        if (facilityType == FacilityType.OreExtractor) {
            ore = 60 * (15 ** level) / (10 ** level);
            crystal = 15 * (15 ** level) / (10 ** level);
            plasma = 0;
        } else if (facilityType == FacilityType.CrystalHarvester) {
            ore = 48 * (16 ** level) / (10 ** level);
            crystal = 24 * (16 ** level) / (10 ** level);
            plasma = 0;
        } else if (facilityType == FacilityType.PlasmaCollector) {
            ore = 225 * (15 ** level) / (10 ** level);
            crystal = 75 * (15 ** level) / (10 ** level);
            plasma = 0;
        } else if (facilityType == FacilityType.SolarArray) {
            ore = 75 * (15 ** level) / (10 ** level);
            crystal = 30 * (15 ** level) / (10 ** level);
            plasma = 0;
        } else if (facilityType == FacilityType.Starport) {
            ore = 400 * (2 ** level) / (2 ** 1);
            crystal = 200 * (2 ** level) / (2 ** 1);
            plasma = 100 * (2 ** level) / (2 ** 1);
        } else if (facilityType == FacilityType.ScienceAcademy) {
            ore = 200 * (2 ** level) / (2 ** 1);
            crystal = 400 * (2 ** level) / (2 ** 1);
            plasma = 200 * (2 ** level) / (2 ** 1);
        } else {
            ore = 100 * (2 ** level) / (2 ** 1);
            crystal = 100 * (2 ** level) / (2 ** 1);
            plasma = 0;
        }
    }
    
    function getResearchCost(ResearchType researchType, uint256 level) public pure returns (uint256 ore, uint256 crystal, uint256 plasma) {
        // Base research costs
        if (researchType == ResearchType.WeaponsSystems || researchType == ResearchType.ShieldMatrix || researchType == ResearchType.HullReinforcement) {
            ore = 800 * (2 ** level) / (2 ** 1);
            crystal = 200 * (2 ** level) / (2 ** 1);
            plasma = 0;
        } else {
            ore = 200 * (2 ** level) / (2 ** 1);
            crystal = 400 * (2 ** level) / (2 ** 1);
            plasma = 100 * (2 ** level) / (2 ** 1);
        }
    }
    
    function getFacilityBuildTime(uint256 colonyId, FacilityType, uint256 level) public view returns (uint256) {
        // Base time in seconds, reduced by Assembly Plant
        uint256 baseTime = 3600 * level; // 1 hour per level
        uint256 assemblyLevel = colonyFacilities[colonyId][FacilityType.AssemblyPlant].level;
        uint256 nanoLevel = colonyFacilities[colonyId][FacilityType.Nanoforge].level;
        
        uint256 reduction = 10000; // 100%
        if (assemblyLevel > 0) reduction = reduction * 100 / (100 + assemblyLevel * 5);
        if (nanoLevel > 0) reduction = reduction * 100 / (100 + nanoLevel * 25);
        
        return (baseTime * reduction) / 10000;
    }
    
    function getResearchTime(uint256 colonyId, ResearchType, uint256 level) public view returns (uint256) {
        uint256 baseTime = 7200 * level; // 2 hours per level
        uint256 academyLevel = colonyFacilities[colonyId][FacilityType.ScienceAcademy].level;
        
        if (academyLevel > 1) {
            return baseTime * 100 / (100 + (academyLevel - 1) * 10);
        }
        return baseTime;
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    function getColonyResources(uint256 colonyId) external view returns (uint256 ore, uint256 crystal, uint256 plasma, uint256 energy) {
        Resources storage res = colonyResources[colonyId];
        uint256 timePassed = block.timestamp - res.lastUpdate;
        
        ore = res.ore + (getOreProduction(colonyId) * timePassed) / 1 hours;
        crystal = res.crystal + (getCrystalProduction(colonyId) * timePassed) / 1 hours;
        plasma = res.plasma + (getPlasmaProduction(colonyId) * timePassed) / 1 hours;
        energy = res.energy;
    }
    
    function getPlayerColonies(address player) external view returns (uint256[] memory) {
        return playerColonies[player];
    }
    
    function getFacilityLevel(uint256 colonyId, FacilityType facilityType) external view returns (uint256) {
        return colonyFacilities[colonyId][facilityType].level;
    }
    
    function getResearchLevel(address player, ResearchType researchType) external view returns (uint256) {
        return playerResearch[player][researchType];
    }
    
    // ========== ADMIN ==========
    
    function setBoostsContract(address _boosts) external onlyOwner {
        boostsContract = _boosts;
    }
}
