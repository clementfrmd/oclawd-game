import React, { useState } from 'react';
import { Building2, Zap, Clock, ArrowUp, Lock, Info } from 'lucide-react';
import { useAccount } from 'wagmi';

// Facility definitions from game design
const FACILITIES = [
  // Resource Production
  { id: 'ore-mine', name: 'Ore Mine', category: 'production', description: 'Extracts raw ore from asteroid fields', baseCost: { ore: 60, crystal: 15 }, baseProduction: { ore: 30 }, energyCost: 10, maxLevel: 30, icon: '⛏️' },
  { id: 'crystal-refinery', name: 'Crystal Refinery', category: 'production', description: 'Processes raw crystals into usable materials', baseCost: { ore: 48, crystal: 24 }, baseProduction: { crystal: 20 }, energyCost: 15, maxLevel: 30, icon: '💎' },
  { id: 'plasma-plant', name: 'Plasma Synthesizer', category: 'production', description: 'Generates plasma from stellar radiation', baseCost: { ore: 225, crystal: 75 }, baseProduction: { plasma: 10 }, energyCost: 25, maxLevel: 30, icon: '🔮' },
  
  // Energy
  { id: 'solar-array', name: 'Solar Array', category: 'energy', description: 'Harnesses solar energy', baseCost: { ore: 75, crystal: 30 }, baseProduction: { energy: 25 }, energyCost: 0, maxLevel: 30, icon: '☀️' },
  { id: 'fusion-reactor', name: 'Fusion Reactor', category: 'energy', description: 'High-output fusion power', baseCost: { ore: 900, crystal: 360, plasma: 180 }, baseProduction: { energy: 50 }, energyCost: 0, maxLevel: 20, icon: '⚛️' },
  
  // Storage
  { id: 'ore-silo', name: 'Ore Silo', category: 'storage', description: 'Stores refined ore', baseCost: { ore: 1000 }, baseStorage: { ore: 10000 }, energyCost: 0, maxLevel: 20, icon: '🏭' },
  { id: 'crystal-vault', name: 'Crystal Vault', category: 'storage', description: 'Secure crystal storage', baseCost: { ore: 1000, crystal: 500 }, baseStorage: { crystal: 10000 }, energyCost: 0, maxLevel: 20, icon: '💠' },
  { id: 'plasma-tank', name: 'Plasma Tank', category: 'storage', description: 'Contained plasma storage', baseCost: { ore: 1000, crystal: 1000 }, baseStorage: { plasma: 10000 }, energyCost: 0, maxLevel: 20, icon: '🫧' },
  
  // Military
  { id: 'shipyard', name: 'Shipyard', category: 'military', description: 'Constructs vessels and fleet units', baseCost: { ore: 400, crystal: 200, plasma: 100 }, buildSpeedBonus: 0.05, energyCost: 30, maxLevel: 15, icon: '🚀', unlocks: 'vessels' },
  { id: 'weapons-lab', name: 'Weapons Research Lab', category: 'military', description: 'Unlocks offensive technologies', baseCost: { ore: 200, crystal: 400, plasma: 200 }, researchBonus: 0.05, energyCost: 20, maxLevel: 12, icon: '🔬', unlocks: 'weapons-tech' },
  { id: 'defense-platform', name: 'Defense Platform', category: 'military', description: 'Orbital defense construction', baseCost: { ore: 500, crystal: 250 }, energyCost: 25, maxLevel: 15, icon: '🛡️', unlocks: 'defenses' },
  
  // Special
  { id: 'research-nexus', name: 'Research Nexus', category: 'special', description: 'Central research hub', baseCost: { ore: 400, crystal: 800, plasma: 400 }, researchBonus: 0.1, energyCost: 40, maxLevel: 15, icon: '🧬', unlocks: 'all-tech' },
  { id: 'trade-hub', name: 'Trade Hub', category: 'special', description: 'Enables marketplace trading', baseCost: { ore: 2000, crystal: 1000, plasma: 500 }, tradeBonus: 0.05, energyCost: 35, maxLevel: 10, icon: '🏛️', unlocks: 'marketplace' },
  { id: 'command-center', name: 'Command Center', category: 'special', description: 'Increases fleet command capacity', baseCost: { ore: 5000, crystal: 4000, plasma: 2000 }, fleetCapBonus: 1000, energyCost: 50, maxLevel: 10, icon: '🎯', unlocks: 'fleet-limit' },
];

const CATEGORIES = [
  { id: 'production', name: 'Resource Production', icon: <Building2 className="w-4 h-4" /> },
  { id: 'energy', name: 'Energy', icon: <Zap className="w-4 h-4" /> },
  { id: 'storage', name: 'Storage', icon: <Building2 className="w-4 h-4" /> },
  { id: 'military', name: 'Military', icon: <Building2 className="w-4 h-4" /> },
  { id: 'special', name: 'Special', icon: <Building2 className="w-4 h-4" /> },
];

export function Facilities() {
  const { isConnected } = useAccount();
  const [selectedCategory, setSelectedCategory] = useState('production');
  const [selectedFacility, setSelectedFacility] = useState(null);
  
  // Mock player facilities (level 0 = not built)
  const [playerFacilities] = useState({
    'ore-mine': 0,
    'crystal-refinery': 0,
    'plasma-plant': 0,
    'solar-array': 0,
  });
  
  // Mock resources
  const [resources] = useState({ ore: 500, crystal: 300, plasma: 100, energy: 50 });
  
  const filteredFacilities = FACILITIES.filter(f => f.category === selectedCategory);
  
  const canAfford = (facility) => {
    if (!facility.baseCost) return true;
    return Object.entries(facility.baseCost).every(([resource, amount]) => 
      resources[resource] >= amount
    );
  };
  
  const buildTime = (facility, level) => {
    const baseTime = 60; // 60 seconds base
    const time = Math.floor(baseTime * Math.pow(1.5, level));
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-slate-500" />
          <h2 className="text-xl font-bold text-slate-300">Connect Wallet</h2>
          <p className="text-slate-500 mt-2">Connect your wallet to manage facilities</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Facilities</h1>
        <p className="text-slate-400">Build and upgrade structures to increase production</p>
      </div>
      
      {/* Onboarding Alert */}
      <div className="bg-sky-900/30 border border-sky-700/50 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sky-300 font-medium">Getting Started</p>
            <p className="text-sky-400/80 text-sm mt-1">
              Start by building an <strong>Ore Mine</strong> to produce ore, then a <strong>Solar Array</strong> for energy.
              Upgrade facilities to increase their output. Higher levels cost more but produce exponentially more resources.
            </p>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-sky-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {cat.icon}
            {cat.name}
          </button>
        ))}
      </div>

      {/* Facility Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFacilities.map(facility => {
          const level = playerFacilities[facility.id] || 0;
          const affordable = canAfford(facility);
          
          return (
            <div
              key={facility.id}
              className={`bg-slate-800/50 border rounded-lg p-4 cursor-pointer transition hover:border-sky-600 ${
                selectedFacility?.id === facility.id ? 'border-sky-500' : 'border-slate-700'
              }`}
              onClick={() => setSelectedFacility(facility)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{facility.icon}</span>
                  <div>
                    <h3 className="font-bold text-slate-100">{facility.name}</h3>
                    <span className="text-sm text-slate-500">Level {level}/{facility.maxLevel}</span>
                  </div>
                </div>
                {level === 0 && <Lock className="w-5 h-5 text-slate-600" />}
              </div>
              
              {/* Description */}
              <p className="text-sm text-slate-400 mb-3">{facility.description}</p>
              
              {/* Cost */}
              <div className="flex flex-wrap gap-2 mb-3">
                {Object.entries(facility.baseCost || {}).map(([resource, amount]) => (
                  <span
                    key={resource}
                    className={`text-xs px-2 py-1 rounded ${
                      resources[resource] >= amount
                        ? 'bg-slate-700 text-slate-300'
                        : 'bg-red-900/30 text-red-400'
                    }`}
                  >
                    {resource}: {amount.toLocaleString()}
                  </span>
                ))}
              </div>
              
              {/* Build Button */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {buildTime(facility, level)}
                </span>
                <button
                  disabled={!affordable}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition ${
                    affordable
                      ? 'bg-sky-600 hover:bg-sky-500 text-white'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <ArrowUp className="w-4 h-4" />
                  {level === 0 ? 'Build' : 'Upgrade'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Empty State */}
      {filteredFacilities.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 mx-auto mb-4 text-slate-600" />
          <p className="text-slate-500">No facilities in this category</p>
        </div>
      )}
    </div>
  );
}
