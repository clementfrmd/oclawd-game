import React, { useState } from 'react';
import { Rocket, Shield, Zap, Target, Package, Eye, Plus, Minus } from 'lucide-react';

const VESSELS = [
  { id: 'scout_fighter', name: 'Scout Fighter', attack: 50, defense: 10, speed: 12500, cargo: 50, cost: { ore: 3000, crystal: 1000, plasma: 0 }, category: 'combat' },
  { id: 'assault_fighter', name: 'Assault Fighter', attack: 150, defense: 25, speed: 10000, cargo: 100, cost: { ore: 6000, crystal: 4000, plasma: 0 }, category: 'combat' },
  { id: 'strike_cruiser', name: 'Strike Cruiser', attack: 400, defense: 50, speed: 15000, cargo: 800, cost: { ore: 20000, crystal: 7000, plasma: 2000 }, category: 'combat' },
  { id: 'dreadnought', name: 'Dreadnought', attack: 1000, defense: 200, speed: 10000, cargo: 1500, cost: { ore: 45000, crystal: 15000, plasma: 0 }, category: 'combat' },
  { id: 'vanguard', name: 'Vanguard', attack: 700, defense: 400, speed: 10000, cargo: 750, cost: { ore: 30000, crystal: 40000, plasma: 15000 }, category: 'combat' },
  { id: 'siege_bomber', name: 'Siege Bomber', attack: 1000, defense: 500, speed: 4000, cargo: 500, cost: { ore: 50000, crystal: 25000, plasma: 15000 }, category: 'combat' },
  { id: 'annihilator', name: 'Annihilator', attack: 2000, defense: 500, speed: 5000, cargo: 2000, cost: { ore: 60000, crystal: 50000, plasma: 15000 }, category: 'combat' },
  { id: 'titan', name: 'Titan', attack: 200000, defense: 900000, speed: 100, cargo: 1000000, cost: { ore: 5000000, crystal: 4000000, plasma: 1000000 }, category: 'combat' },
  { id: 'courier', name: 'Courier', attack: 5, defense: 10, speed: 5000, cargo: 5000, cost: { ore: 2000, crystal: 2000, plasma: 0 }, category: 'support' },
  { id: 'freighter', name: 'Freighter', attack: 5, defense: 25, speed: 7500, cargo: 25000, cost: { ore: 6000, crystal: 6000, plasma: 0 }, category: 'support' },
  { id: 'pioneer', name: 'Pioneer', attack: 50, defense: 100, speed: 2500, cargo: 7500, cost: { ore: 10000, crystal: 20000, plasma: 10000 }, category: 'support' },
  { id: 'salvager', name: 'Salvager', attack: 1, defense: 16, speed: 2000, cargo: 20000, cost: { ore: 10000, crystal: 6000, plasma: 2000 }, category: 'support' },
  { id: 'shadow_probe', name: 'Shadow Probe', attack: 0, defense: 1, speed: 100000000, cargo: 5, cost: { ore: 0, crystal: 1000, plasma: 0 }, category: 'support' },
  { id: 'voidrunner', name: 'Voidrunner', attack: 200, defense: 100, speed: 12000, cargo: 10000, cost: { ore: 8000, crystal: 15000, plasma: 8000 }, category: 'expedition' },
];

export function Fleet() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [buildQueue, setBuildQueue] = useState({});
  
  // Mock fleet data
  const [myFleet, setMyFleet] = useState({
    scout_fighter: 45,
    assault_fighter: 28,
    strike_cruiser: 32,
    dreadnought: 12,
    vanguard: 5,
    courier: 20,
    freighter: 15,
    shadow_probe: 50,
  });

  const categories = [
    { id: 'all', label: 'All Vessels' },
    { id: 'combat', label: 'Combat' },
    { id: 'support', label: 'Support' },
    { id: 'expedition', label: 'Expedition' },
  ];

  const filteredVessels = selectedCategory === 'all' 
    ? VESSELS 
    : VESSELS.filter(v => v.category === selectedCategory);

  const totalPower = Object.entries(myFleet).reduce((acc, [id, count]) => {
    const vessel = VESSELS.find(v => v.id === id);
    return acc + (vessel ? vessel.attack * count : 0);
  }, 0);

  const updateBuildQueue = (id, delta) => {
    setBuildQueue(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta)
    }));
  };

  return (
    <div className="min-h-screen relative">
      <div className="stars-bg" />
      <div className="nebula" />
      
      <div className="relative max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
              <Rocket className="w-8 h-8 text-orange-400" />
              FLEET COMMAND
            </h1>
            <p className="text-gray-400 mt-1">
              Build and manage your armada
            </p>
          </div>
          
          {/* Fleet Stats */}
          <div className="flex gap-6">
            <div className="text-center">
              <div className="font-mono text-2xl text-white">{Object.values(myFleet).reduce((a, b) => a + b, 0)}</div>
              <div className="text-gray-400 text-sm">Total Ships</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-2xl text-orange-400">{totalPower.toLocaleString()}</div>
              <div className="text-gray-400 text-sm">Fleet Power</div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Vessel Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredVessels.map((vessel) => (
            <VesselCard
              key={vessel.id}
              vessel={vessel}
              owned={myFleet[vessel.id] || 0}
              buildCount={buildQueue[vessel.id] || 0}
              onBuildChange={(delta) => updateBuildQueue(vessel.id, delta)}
            />
          ))}
        </div>

        {/* Build Summary */}
        {Object.values(buildQueue).some(v => v > 0) && (
          <div className="fixed bottom-0 left-0 right-0 bg-black/90 border-t border-cyan-500/30 p-4 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div>
                <span className="text-gray-400">Build Queue: </span>
                {Object.entries(buildQueue)
                  .filter(([_, count]) => count > 0)
                  .map(([id, count]) => {
                    const vessel = VESSELS.find(v => v.id === id);
                    return (
                      <span key={id} className="mr-4">
                        <span className="text-white">{count}x</span>{' '}
                        <span className="text-cyan-400">{vessel?.name}</span>
                      </span>
                    );
                  })}
              </div>
              <button className="btn-primary py-2 px-6">
                Start Construction
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function VesselCard({ vessel, owned, buildCount, onBuildChange }) {
  const categoryColors = {
    combat: 'border-red-500/30 hover:border-red-500/50',
    support: 'border-blue-500/30 hover:border-blue-500/50',
    expedition: 'border-purple-500/30 hover:border-purple-500/50',
  };

  const categoryIcons = {
    combat: <Target className="w-5 h-5 text-red-400" />,
    support: <Package className="w-5 h-5 text-blue-400" />,
    expedition: <Eye className="w-5 h-5 text-purple-400" />,
  };

  return (
    <div className={`panel ${categoryColors[vessel.category]} p-4 transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {categoryIcons[vessel.category]}
          <h3 className="font-display text-lg text-white">{vessel.name}</h3>
        </div>
        {owned > 0 && (
          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-sm font-mono rounded">
            {owned}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4 text-sm">
        <div className="text-center p-2 bg-black/30 rounded">
          <div className="text-red-400 font-mono">{vessel.attack}</div>
          <div className="text-gray-500 text-xs">ATK</div>
        </div>
        <div className="text-center p-2 bg-black/30 rounded">
          <div className="text-blue-400 font-mono">{vessel.defense}</div>
          <div className="text-gray-500 text-xs">DEF</div>
        </div>
        <div className="text-center p-2 bg-black/30 rounded">
          <div className="text-cyan-400 font-mono">{vessel.speed >= 1000000 ? 'MAX' : vessel.speed}</div>
          <div className="text-gray-500 text-xs">SPD</div>
        </div>
        <div className="text-center p-2 bg-black/30 rounded">
          <div className="text-yellow-400 font-mono">{vessel.cargo >= 1000 ? `${Math.floor(vessel.cargo/1000)}k` : vessel.cargo}</div>
          <div className="text-gray-500 text-xs">CARGO</div>
        </div>
      </div>

      {/* Cost */}
      <div className="flex gap-3 mb-4 text-sm">
        {vessel.cost.ore > 0 && (
          <span className="text-amber-400">⛏️ {vessel.cost.ore.toLocaleString()}</span>
        )}
        {vessel.cost.crystal > 0 && (
          <span className="text-blue-400">💎 {vessel.cost.crystal.toLocaleString()}</span>
        )}
        {vessel.cost.plasma > 0 && (
          <span className="text-purple-400">🔮 {vessel.cost.plasma.toLocaleString()}</span>
        )}
      </div>

      {/* Build Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onBuildChange(-1)}
          className="p-2 bg-white/10 rounded hover:bg-white/20 transition-colors"
          disabled={buildCount === 0}
        >
          <Minus className="w-4 h-4" />
        </button>
        <input
          type="number"
          value={buildCount}
          onChange={(e) => onBuildChange(parseInt(e.target.value) - buildCount || 0)}
          className="flex-1 bg-black/30 border border-white/10 rounded px-3 py-2 text-center font-mono"
          min="0"
        />
        <button
          onClick={() => onBuildChange(1)}
          className="p-2 bg-white/10 rounded hover:bg-white/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => onBuildChange(10)}
          className="px-3 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 rounded hover:bg-cyan-500/30 text-sm"
        >
          +10
        </button>
      </div>
    </div>
  );
}
