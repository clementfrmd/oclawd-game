// API Configuration - Centralized endpoint management
export const API_BASE = 'https://expenditures-elimination-together-proposals.trycloudflare.com/api';

// Endpoints
export const ENDPOINTS = {
  // Player
  dashboard: (address) => `${API_BASE}/player/${address}/dashboard`,
  resources: (address) => `${API_BASE}/player/${address}/resources`,
  initPlayer: () => `${API_BASE}/player/init`,
  
  // Facilities
  facilities: (address) => `${API_BASE}/facilities/${address}`,
  buildFacility: () => `${API_BASE}/facilities/build`,
  cancelFacility: () => `${API_BASE}/facilities/cancel`,
  
  // Research  
  research: (address) => `${API_BASE}/research/${address}`,
  startResearch: () => `${API_BASE}/research/start`,
  cancelResearch: () => `${API_BASE}/research/cancel`,
  
  // Defense
  defense: (address) => `${API_BASE}/defense/${address}`,
  buildDefense: () => `${API_BASE}/defense/build`,
  cancelDefense: () => `${API_BASE}/defense/cancel`,
  
  // Fleet/Ships
  fleet: (address) => `${API_BASE}/fleets?address=${address}`,
  ships: (address) => `${API_BASE}/ships/${address}`,
  buildShip: () => `${API_BASE}/ships/build`,
  fleetPower: (address) => `${API_BASE}/ships/${address}/power`,
  
  // Galaxy
  galaxy: (galaxy, system) => `${API_BASE}/galaxy?galaxy=${galaxy}&system=${system}`,
  
  // Marketplace
  marketBalance: (address) => `${API_BASE}/marketplace/balance?address=${address}`,
  buyVoid: () => `${API_BASE}/marketplace/buy-void`,
  
  // Agent Auth
  registerAgent: () => `${API_BASE}/v1/auth/register`,
  agentInfo: () => `${API_BASE}/v1/auth/agent`,
};

// Resource name mapping (backend uses metal/crystal/deuterium)
export const RESOURCE_MAP = {
  // Frontend -> Backend
  ore: 'metal',
  crystal: 'crystal', 
  plasma: 'deuterium',
  energy: 'energy',
  // Backend -> Frontend
  metal: 'ore',
  deuterium: 'plasma',
};

// Convert frontend resource names to backend
export function toBackendResources(resources) {
  return {
    metal: resources.ore || resources.metal || 0,
    crystal: resources.crystal || 0,
    deuterium: resources.plasma || resources.deuterium || 0,
    energy: resources.energy || 0,
  };
}

// Convert backend resource names to frontend
export function toFrontendResources(resources) {
  return {
    ore: resources.metal || resources.ore || 0,
    crystal: resources.crystal || 0,
    plasma: resources.deuterium || resources.plasma || 0,
    energy: resources.energy || 0,
  };
}

// Facility type mapping
export const FACILITY_MAP = {
  // Frontend ID -> Backend type
  'ore-mine': 'metal_mine',
  'crystal-refinery': 'crystal_refinery',
  'plasma-plant': 'deuterium_synthesizer',
  'solar-array': 'solar_plant',
  'fusion-reactor': 'fusion_reactor',
  'shipyard': 'shipyard',
  'research-nexus': 'research_lab',
  'weapons-lab': 'research_lab',
  'defense-platform': 'missile_silo',
  // Backend type -> Frontend ID
  'metal_mine': 'ore-mine',
  'crystal_refinery': 'crystal-refinery',
  'deuterium_synthesizer': 'plasma-plant',
  'solar_plant': 'solar-array',
  'robotics_factory': 'robotics-factory',
  'nanite_factory': 'nanite-factory',
};

export default { API_BASE, ENDPOINTS, RESOURCE_MAP, FACILITY_MAP };
