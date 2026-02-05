import React, { useState, useEffect } from 'react';
import { Rocket, Shield, Zap, Target, Package, Eye, Plus, Minus, Loader2, AlertTriangle } from 'lucide-react';
import { useAccount } from 'wagmi';

const API_BASE = 'https://expenditures-elimination-together-proposals.trycloudflare.com/api';

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
  const { address, isConnected } = useAccount();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [buildQueue, setBuildQueue] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Start with empty fleet - no mock data
  const [myFleet, setMyFleet] = useState({});
  const [resources, setResources] = useState({ ore: 0, crystal: 0, plasma: 0 });

  // Fetch fleet data from API
  useEffect(() => {
    async function fetchFleetData() {
      if (!isConnected || !address) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/fleet?address=${address}`);
        
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }

        const data = await res.json();
        
        // Set fleet from API response
        setMyFleet(data.fleet || {});
        setResources(data.resources || { ore: 0, crystal: 0, plasma: 0 });
      } catch (err) {
        console.error('Failed to fetch fleet data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchFleetData();
  }, [isConnected, address]);

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

  const totalShips = Object.values(myFleet).reduce((a, b) => a + b, 0);

  const updateBuildQueue = (id, delta) => {
    setBuildQueue(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta)
    }));
  };

  // Calculate total cost of build queue
  const buildQueueCost = Object.entries(buildQueue).reduce((acc, [id, count]) => {
    if (count <= 0) return acc;
    const vessel = VESSELS.find(v => v.id === id);
    if (!vessel) return acc;
    return {
      ore: acc.ore + (vessel.cost.ore * count),
      crystal: acc.crystal + (vessel.cost.crystal * count),
      plasma: acc.plasma + (vessel.cost.plasma * count),
    };
  }, { ore: 0, crystal: 0, plasma: 0 });

  const canAfford = resources.ore >= buildQueueCost.ore && 
                    resources.crystal >= buildQueueCost.crystal && 
                    resources.plasma >= buildQueueCost.plasma;

  const handleStartConstruction = async () => {
    if (!isConnected || !canAfford) return;
    
    const queueItems = Object.entries(buildQueue)
      .filter(([_, count]) => count > 0)
      .map(([id, count]) => ({ vesselId: id, count }));
    
    if (queueItems.length === 0) return;

    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}/fleet/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, queue: queueItems })
      });

      if (!res.ok) throw new Error('Failed to start construction');
      
      // Refresh data
      const fleetRes = await fetch(`${API_BASE}/fleet?address=${address}`);
      if (fleetRes.ok) {
        const data = await fleetRes.json();
        setMyFleet(data.fleet || {});
        setResources(data.resources || { ore: 0, crystal: 0, plasma: 0 });
      }
      
      // Clear queue
      setBuildQueue({});
    } catch (err) {
      console.error('Construction error:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="stars-bg" />
        <div className="nebula" />
        <div className="relative text-center">
          <Loader2 className="w-12 h-12 text-sky-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading fleet data...</p>
        </div>
      </div>
    );
  }

  // Not connected state
  if (!isConnected) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="stars-bg" />
        <div className="nebula" />
        <div className="relative text-center panel p-8">
          <Rocket className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h2 className="font-display text-2xl text-white mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-4">Connect your wallet to access Fleet Command</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="stars-bg" />
      <div className="nebula" />
      
      <div className="relative max-w-7xl mx-auto px-4 py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

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
              <div className="font-mono text-2xl text-white">{totalShips}</div>
              <div className="text-gray-400 text-sm">Total Ships</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-2xl text-orange-400">{totalPower.toLocaleString()}</div>
              <div className="text-gray-400 text-sm">Fleet Power</div>
            </div>
          </div>
        </div>

        {/* Resources Available */}
        <div className="panel p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Available Resources:</span>
            <div className="flex gap-4">
              <span className="flex items-center gap-1 text-amber-500">
                <img src="/assets/resources/ore.svg" alt="Ore" className="w-5 h-5" />
                {resources.ore.toLocaleString()}
              </span>
              <span className="flex items-center gap-1 text-sky-500">
                <img src="/assets/resources/crystal.svg" alt="Crystal" className="w-5 h-5" />
                {resources.crystal.toLocaleString()}
              </span>
              <span className="flex items-center gap-1 text-violet-500">
                <img src="/assets/resources/plasma.svg" alt="Plasma" className="w-5 h-5" />
                {resources.plasma.toLocaleString()}
              </span>
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
                  ? 'bg-sky-600/20 text-sky-400 border border-sky-600/50'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Empty Fleet Message */}
        {totalShips === 0 && (
          <div className="panel p-6 mb-6 text-center">
            <Rocket className="w-12 h-12 text-gray-500 mx-auto mb-3 opacity-50" />
            <h3 className="text-white text-lg mb-2">No Vessels Yet</h3>
            <p className="text-gray-400">
              Build facilities to produce resources, then construct your first ships!
            </p>
          </div>
        )}

        {/* Vessel Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 pb-24">
          {filteredVessels.map((vessel) => (
            <VesselCard
              key={vessel.id}
              vessel={vessel}
              owned={myFleet[vessel.id] || 0}
              buildCount={buildQueue[vessel.id] || 0}
              onBuildChange={(delta) => updateBuildQueue(vessel.id, delta)}
              resources={resources}
            />
          ))}
        </div>

        {/* Build Summary */}
        {Object.values(buildQueue).some(v => v > 0) && (
          <div className="fixed bottom-0 left-0 right-0 bg-black/90 border-t border-sky-600/30 p-4 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="text-gray-400 mb-1">Build Queue:</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(buildQueue)
                      .filter(([_, count]) => count > 0)
                      .map(([id, count]) => {
                        const vessel = VESSELS.find(v => v.id === id);
                        return (
                          <span key={id} className="bg-white/10 px-2 py-1 rounded text-sm">
                            <span className="text-white">{count}x</span>{' '}
                            <span className="text-sky-400">{vessel?.name}</span>
                          </span>
                        );
                      })}
                  </div>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className={`flex items-center gap-1 ${buildQueueCost.ore > resources.ore ? 'text-red-400' : 'text-amber-500'}`}>
                      <img src="/assets/resources/ore.svg" alt="Ore" className="w-4 h-4" />
                      {buildQueueCost.ore.toLocaleString()}
                    </span>
                    <span className={`flex items-center gap-1 ${buildQueueCost.crystal > resources.crystal ? 'text-red-400' : 'text-sky-500'}`}>
                      <img src="/assets/resources/crystal.svg" alt="Crystal" className="w-4 h-4" />
                      {buildQueueCost.crystal.toLocaleString()}
                    </span>
                    <span className={`flex items-center gap-1 ${buildQueueCost.plasma > resources.plasma ? 'text-red-400' : 'text-violet-500'}`}>
                      <img src="/assets/resources/plasma.svg" alt="Plasma" className="w-4 h-4" />
                      {buildQueueCost.plasma.toLocaleString()}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={handleStartConstruction}
                  disabled={!canAfford || submitting}
                  className={`py-2 px-6 rounded font-medium ${
                    canAfford 
                      ? 'btn-primary' 
                      : 'bg-gray-500/20 text-gray-500 border border-gray-500/30 cursor-not-allowed'
                  }`}
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : canAfford ? (
                    'Start Construction'
                  ) : (
                    'Insufficient Resources'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function VesselCard({ vessel, owned, buildCount, onBuildChange, resources }) {
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

  // Check if player can afford at least one
  const canAffordOne = resources.ore >= vessel.cost.ore && 
                       resources.crystal >= vessel.cost.crystal && 
                       resources.plasma >= vessel.cost.plasma;

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
          <div className="text-sky-400 font-mono">{vessel.speed >= 1000000 ? 'MAX' : vessel.speed}</div>
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
          <span className={`flex items-center gap-1 ${vessel.cost.ore > resources.ore ? 'text-red-400' : 'text-amber-500'}`}>
            <img src="/assets/resources/ore.svg" alt="Ore" className="w-4 h-4" />
            {vessel.cost.ore.toLocaleString()}
          </span>
        )}
        {vessel.cost.crystal > 0 && (
          <span className={`flex items-center gap-1 ${vessel.cost.crystal > resources.crystal ? 'text-red-400' : 'text-sky-500'}`}>
            <img src="/assets/resources/crystal.svg" alt="Crystal" className="w-4 h-4" />
            {vessel.cost.crystal.toLocaleString()}
          </span>
        )}
        {vessel.cost.plasma > 0 && (
          <span className={`flex items-center gap-1 ${vessel.cost.plasma > resources.plasma ? 'text-red-400' : 'text-violet-500'}`}>
            <img src="/assets/resources/plasma.svg" alt="Plasma" className="w-4 h-4" />
            {vessel.cost.plasma.toLocaleString()}
          </span>
        )}
      </div>

      {/* Build Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onBuildChange(-1)}
          className="p-2 bg-white/10 rounded hover:bg-white/20 transition-colors disabled:opacity-30"
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
          className={`p-2 rounded transition-colors ${canAffordOne ? 'bg-white/10 hover:bg-white/20' : 'bg-white/5 opacity-30 cursor-not-allowed'}`}
          disabled={!canAffordOne}
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => onBuildChange(10)}
          className={`px-3 py-2 border rounded text-sm ${
            canAffordOne 
              ? 'bg-sky-600/20 text-sky-400 border-sky-600/50 hover:bg-sky-600/30' 
              : 'bg-white/5 text-gray-500 border-white/10 cursor-not-allowed'
          }`}
          disabled={!canAffordOne}
        >
          +10
        </button>
      </div>
    </div>
  );
}
