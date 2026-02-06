import React, { useState, useEffect } from 'react';
import { Shield, Crosshair, Clock, Plus, Lock, Info, Zap, Target, Loader2, CheckCircle } from 'lucide-react';
import { useAccount } from 'wagmi';
import { ENDPOINTS } from '../config/api';

// Defense definitions from game design
const DEFENSES = [
  // Light Defenses
  { id: 'pulse-turret', name: 'Pulse Turret', category: 'light', description: 'Basic rapid-fire defense', baseCost: { ore: 2000 }, attack: 80, shields: 20, hull: 200, energyCost: 5, icon: '🔫' },
  { id: 'laser-battery', name: 'Laser Battery', category: 'light', description: 'Medium-power laser defense', baseCost: { ore: 1500, crystal: 500 }, attack: 100, shields: 25, hull: 250, energyCost: 8, icon: '⚡' },
  { id: 'flak-cannon', name: 'Flak Cannon', category: 'light', description: 'Anti-fighter defense system', baseCost: { ore: 3000, crystal: 1000 }, attack: 150, shields: 50, hull: 300, energyCost: 10, icon: '💥' },
  
  // Heavy Defenses
  { id: 'ion-cannon', name: 'Ion Cannon', category: 'heavy', description: 'Heavy ion-based weapon', baseCost: { ore: 5000, crystal: 3000 }, attack: 250, shields: 100, hull: 500, energyCost: 20, icon: '🌩️' },
  { id: 'gauss-cannon', name: 'Gauss Cannon', category: 'heavy', description: 'Magnetic accelerator cannon', baseCost: { ore: 20000, crystal: 15000, plasma: 2000 }, attack: 1100, shields: 200, hull: 3500, energyCost: 35, icon: '🔩' },
  { id: 'plasma-cannon', name: 'Plasma Cannon', category: 'heavy', description: 'Devastating plasma weapon', baseCost: { ore: 50000, crystal: 50000, plasma: 30000 }, attack: 3000, shields: 300, hull: 10000, energyCost: 50, icon: '🔮' },
  
  // Shields
  { id: 'small-shield', name: 'Small Shield Dome', category: 'shields', description: 'Basic planetary shield', baseCost: { ore: 10000, crystal: 10000 }, attack: 1, shields: 2000, hull: 2000, energyCost: 25, limit: 1, icon: '🛡️' },
  { id: 'large-shield', name: 'Large Shield Dome', category: 'shields', description: 'Advanced planetary shield', baseCost: { ore: 50000, crystal: 50000 }, attack: 1, shields: 10000, hull: 10000, energyCost: 100, limit: 1, icon: '🌐' },
  
  // Missiles
  { id: 'rocket-launcher', name: 'Rocket Launcher', category: 'missiles', description: 'Basic missile defense', baseCost: { ore: 2000 }, attack: 80, shields: 20, hull: 200, energyCost: 3, icon: '🚀' },
  { id: 'missile-silo', name: 'Missile Silo', category: 'missiles', description: 'Advanced guided missiles', baseCost: { ore: 8000, crystal: 2000, plasma: 2000 }, attack: 400, shields: 100, hull: 1200, energyCost: 15, icon: '🎯' },
  { id: 'ipm-launcher', name: 'Interplanetary Missile', category: 'missiles', description: 'Strategic strike weapon', baseCost: { ore: 12500, crystal: 2500, plasma: 10000 }, attack: 12000, shields: 1, hull: 15000, energyCost: 0, special: 'One-time use', icon: '☢️' },
];

const CATEGORIES = [
  { id: 'light', name: 'Light Defense', icon: <Crosshair className="w-4 h-4" /> },
  { id: 'heavy', name: 'Heavy Weapons', icon: <Target className="w-4 h-4" /> },
  { id: 'shields', name: 'Shields', icon: <Shield className="w-4 h-4" /> },
  { id: 'missiles', name: 'Missiles', icon: <Zap className="w-4 h-4" /> },
];

// Map frontend resource names to backend names for cost display
const RESOURCE_DISPLAY = {
  ore: 'metal',
  crystal: 'crystal',
  plasma: 'deuterium',
};

export function Defense() {
  const { address, isConnected } = useAccount();
  const [selectedCategory, setSelectedCategory] = useState('light');
  const [selectedDefense, setSelectedDefense] = useState(null);
  const [buildAmount, setBuildAmount] = useState(1);
  
  // State for backend data
  const [playerDefenses, setPlayerDefenses] = useState({});
  const [resources, setResources] = useState({ metal: 0, crystal: 0, deuterium: 0, energy: 0 });
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [buildingDefenses, setBuildingDefenses] = useState([]);
  
  // Fetch defense data and resources on mount
  useEffect(() => {
    if (!isConnected || !address) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch defenses
        const defRes = await fetch(ENDPOINTS.defense(address));
        const defData = await defRes.json();
        
        // Fetch resources
        const resRes = await fetch(ENDPOINTS.resources(address));
        const resData = await resRes.json();
        
        if (defData.defenses) {
          // Convert array to map by defense type
          const defenseMap = {};
          const buildingList = [];
          defData.defenses.forEach(d => {
            defenseMap[d.defenseType] = d.quantity || 0;
            if (d.isBuilding) {
              buildingList.push(d.defenseType);
            }
          });
          setPlayerDefenses(defenseMap);
          setBuildingDefenses(buildingList);
        }
        
        if (resData.resources) {
          setResources(resData.resources);
        }
      } catch (err) {
        console.error('Failed to fetch defense data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [isConnected, address]);
  
  // Check if player has defense platform (missile_silo facility)
  const hasDefensePlatform = true; // TODO: Check from facilities if needed
  
  const filteredDefenses = DEFENSES.filter(d => d.category === selectedCategory);
  
  const canAfford = (defense, amount = 1) => {
    if (!defense.baseCost) return true;
    return Object.entries(defense.baseCost).every(([resource, cost]) => {
      const backendResource = RESOURCE_DISPLAY[resource] || resource;
      return (resources[backendResource] || 0) >= cost * amount;
    });
  };
  
  const buildTime = (defense, amount = 1) => {
    const baseTime = 30;
    const time = baseTime * amount;
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };
  
  const totalCost = (defense, amount) => {
    const costs = {};
    Object.entries(defense.baseCost || {}).forEach(([resource, cost]) => {
      costs[resource] = cost * amount;
    });
    return costs;
  };

  const handleBuild = async (defense, amount) => {
    if (!address || building) return;
    
    setBuilding(defense.id);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch(ENDPOINTS.buildDefense(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerAddress: address,
          defenseType: defense.id,
          quantity: amount,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to build defense');
      }
      
      setSuccess(`Building ${amount}x ${defense.name}!`);
      
      // Refresh data
      const defRes = await fetch(ENDPOINTS.defense(address));
      const defData = await defRes.json();
      if (defData.defenses) {
        const defenseMap = {};
        const buildingList = [];
        defData.defenses.forEach(d => {
          defenseMap[d.defenseType] = d.quantity || 0;
          if (d.isBuilding) {
            buildingList.push(d.defenseType);
          }
        });
        setPlayerDefenses(defenseMap);
        setBuildingDefenses(buildingList);
      }
      
      const resRes = await fetch(ENDPOINTS.resources(address));
      const resData = await resRes.json();
      if (resData.resources) setResources(resData.resources);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setBuilding(null);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-slate-500" />
          <h2 className="text-xl font-bold text-slate-300">Connect Wallet</h2>
          <p className="text-slate-500 mt-2">Connect your wallet to build defenses</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Defense Systems</h1>
        <p className="text-slate-400 text-sm sm:text-base">Build defensive structures to protect your colony</p>
      </div>
      
      {/* Resources Bar */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
          <div>
            <div className="text-xs sm:text-sm text-slate-400">Metal</div>
            <div className="text-base sm:text-lg font-bold text-orange-400">{Math.floor(resources.metal || 0).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs sm:text-sm text-slate-400">Crystal</div>
            <div className="text-base sm:text-lg font-bold text-cyan-400">{Math.floor(resources.crystal || 0).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs sm:text-sm text-slate-400">Deuterium</div>
            <div className="text-base sm:text-lg font-bold text-purple-400">{Math.floor(resources.deuterium || 0).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs sm:text-sm text-slate-400">Energy</div>
            <div className="text-base sm:text-lg font-bold text-yellow-400">{Math.floor(resources.energy || 0).toLocaleString()}</div>
          </div>
        </div>
      </div>
      
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
          <span className="text-green-300 text-sm sm:text-base">{success}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <span className="text-red-300 text-sm sm:text-base">{error}</span>
        </div>
      )}
      
      {/* Info Box */}
      <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex items-start gap-2 sm:gap-3">
          <Info className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 font-medium text-sm sm:text-base">Defense Strategy</p>
            <p className="text-red-400/80 text-xs sm:text-sm mt-1">
              Defenses protect your resources when you're attacked. A balanced mix of light and heavy defenses provides the best protection.
              Shield domes protect all defenses but you can only have one of each type.
            </p>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 min-h-[44px] rounded-lg font-medium transition whitespace-nowrap text-sm sm:text-base ${
              selectedCategory === cat.id
                ? 'bg-red-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 active:bg-slate-600'
            }`}
          >
            {cat.icon}
            {cat.name}
          </button>
        ))}
      </div>

      {/* Defense Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredDefenses.map(defense => {
          const count = playerDefenses[defense.id] || 0;
          const affordable = canAfford(defense, buildAmount);
          const canBuild = affordable && hasDefensePlatform;
          const atLimit = defense.limit && count >= defense.limit;
          const isBuilding = building === defense.id;
          const isCurrentlyBuilding = buildingDefenses.includes(defense.id);
          
          return (
            <div
              key={defense.id}
              className={`bg-slate-800/50 border rounded-lg p-3 sm:p-4 cursor-pointer transition hover:border-red-600 ${
                selectedDefense?.id === defense.id ? 'border-red-500' : 'border-slate-700'
              } ${!hasDefensePlatform ? 'opacity-60' : ''}`}
              onClick={() => setSelectedDefense(defense)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-2xl sm:text-3xl">{defense.icon}</span>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm sm:text-base">{defense.name}</h3>
                    <span className="text-xs sm:text-sm text-slate-500">
                      Owned: {count}{defense.limit ? `/${defense.limit}` : ''}
                    </span>
                  </div>
                </div>
                {isCurrentlyBuilding && (
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                    Building...
                  </span>
                )}
              </div>
              
              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-400 mb-2">{defense.description}</p>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-2 sm:mb-3 text-xs">
                <div className="bg-slate-700/50 rounded p-1.5 sm:p-2 text-center">
                  <div className="text-red-400 font-bold text-xs sm:text-sm">{defense.attack}</div>
                  <div className="text-slate-500 text-[10px] sm:text-xs">Attack</div>
                </div>
                <div className="bg-slate-700/50 rounded p-1.5 sm:p-2 text-center">
                  <div className="text-blue-400 font-bold text-xs sm:text-sm">{defense.shields}</div>
                  <div className="text-slate-500 text-[10px] sm:text-xs">Shield</div>
                </div>
                <div className="bg-slate-700/50 rounded p-1.5 sm:p-2 text-center">
                  <div className="text-slate-300 font-bold text-xs sm:text-sm">{defense.hull}</div>
                  <div className="text-slate-500 text-[10px] sm:text-xs">Hull</div>
                </div>
              </div>
              
              {/* Cost */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                {Object.entries(totalCost(defense, buildAmount)).map(([resource, amount]) => {
                  const backendResource = RESOURCE_DISPLAY[resource] || resource;
                  const hasEnough = (resources[backendResource] || 0) >= amount;
                  return (
                    <span
                      key={resource}
                      className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded ${
                        hasEnough
                          ? 'bg-slate-700 text-slate-300'
                          : 'bg-red-900/30 text-red-400'
                      }`}
                    >
                      {backendResource}: {amount.toLocaleString()}
                    </span>
                  );
                })}
              </div>
              
              {/* Amount & Build */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {buildTime(defense, buildAmount)}
                  </span>
                  {!defense.limit && (
                    <select
                      value={buildAmount}
                      onChange={(e) => setBuildAmount(parseInt(e.target.value))}
                      className="bg-slate-700 border border-slate-600 rounded px-2 py-1.5 min-h-[36px] text-xs text-slate-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value={1}>×1</option>
                      <option value={5}>×5</option>
                      <option value={10}>×10</option>
                      <option value={50}>×50</option>
                    </select>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBuild(defense, defense.limit ? 1 : buildAmount);
                  }}
                  disabled={!canBuild || atLimit || isBuilding}
                  className={`flex items-center gap-1 px-3 py-2 min-h-[44px] rounded text-sm font-medium transition ${
                    canBuild && !atLimit
                      ? 'bg-red-600 hover:bg-red-500 active:bg-red-400 text-white'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isBuilding ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {atLimit ? 'Max' : 'Build'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
