// Asset paths for Void Conquest
// Military-themed space assets

export const VESSEL_ICONS = {
  scout_fighter: '/assets/vessels/scout-fighter.svg',
  assault_fighter: '/assets/vessels/assault-fighter.svg',
  strike_cruiser: '/assets/vessels/strike-cruiser.svg',
  dreadnought: '/assets/vessels/dreadnought.svg',
  vanguard: '/assets/vessels/vanguard.svg',
  siege_bomber: '/assets/vessels/dreadnought.svg', // reuse dreadnought
  annihilator: '/assets/vessels/titan.svg', // reuse titan
  titan: '/assets/vessels/titan.svg',
  courier: '/assets/vessels/courier.svg',
  freighter: '/assets/vessels/freighter.svg',
  pioneer: '/assets/vessels/freighter.svg', // reuse freighter
  salvager: '/assets/vessels/freighter.svg', // reuse freighter
  shadow_probe: '/assets/vessels/shadow-probe.svg',
  voidrunner: '/assets/vessels/strike-cruiser.svg', // reuse cruiser
};

export const RESOURCE_ICONS = {
  ore: '/assets/resources/ore.svg',
  crystal: '/assets/resources/crystal.svg',
  plasma: '/assets/resources/plasma.svg',
  energy: '/assets/resources/energy.svg',
};

export const BUILDING_ICONS = {
  ore_extractor: '/assets/buildings/ore-mine.svg',
  ore_mine: '/assets/buildings/ore-mine.svg',
  crystal_synthesizer: '/assets/buildings/crystal-refinery.svg',
  crystal_refinery: '/assets/buildings/crystal-refinery.svg',
  plasma_harvester: '/assets/buildings/plasma-plant.svg',
  plasma_plant: '/assets/buildings/plasma-plant.svg',
  power_station: '/assets/buildings/power-station.svg',
  solar_array: '/assets/buildings/power-station.svg',
  fusion_reactor: '/assets/buildings/power-station.svg',
  shipyard: '/assets/buildings/shipyard.svg',
  starport: '/assets/buildings/shipyard.svg',
  research_lab: '/assets/buildings/research-lab.svg',
  nanite_factory: '/assets/buildings/research-lab.svg',
};

export const TECH_ICONS = {
  weapons: '/assets/tech/weapons.svg',
  weapons_systems: '/assets/tech/weapons.svg',
  shields: '/assets/tech/shields.svg',
  shield_tech: '/assets/tech/shields.svg',
  propulsion: '/assets/tech/propulsion.svg',
  engines: '/assets/tech/propulsion.svg',
  hyperspace: '/assets/tech/propulsion.svg',
};

export const MISC_ICONS = {
  logo: '/assets/logo.svg',
  background: '/assets/backgrounds/space-bg.svg',
};

// Helper to get vessel icon with fallback
export function getVesselIcon(vesselId) {
  return VESSEL_ICONS[vesselId] || VESSEL_ICONS.scout_fighter;
}

// Helper to get resource icon
export function getResourceIcon(resourceType) {
  return RESOURCE_ICONS[resourceType] || RESOURCE_ICONS.ore;
}

// Helper to get building icon
export function getBuildingIcon(buildingId) {
  return BUILDING_ICONS[buildingId] || BUILDING_ICONS.power_station;
}

// Helper to get tech icon
export function getTechIcon(techId) {
  return TECH_ICONS[techId] || TECH_ICONS.weapons;
}
