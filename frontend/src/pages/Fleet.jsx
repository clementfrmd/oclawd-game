import React, { useState, useEffect } from 'react';
import { Rocket, Shield, Crosshair, Gauge, Package, Clock, Loader2, CheckCircle, Info } from 'lucide-react';
import { useAccount } from 'wagmi';
import { ENDPOINTS } from '../config/api';

const API_BASE = 'https://expenditures-elimination-together-proposals.trycloudflare.com/api';

export function Fleet() {
  const { address, isConnected } = useAccount();
  const [ships, setShips] = useState([]);
  const [resources, setResources] = useState({ metal: 0, crystal: 0, deuterium: 0 });
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(null);
  const [buildQty, setBuildQty] = useState(1);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!isConnected || !address) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch ships
        const shipRes = await fetch(`${API_BASE}/ships/${address}`);
        const shipData = await shipRes.json();
        if (shipData.ships) setShips(shipData.ships);
        
        // Fetch resources
        const resRes = await fetch(ENDPOINTS.resources(address));
        const resData = await resRes.json();
        if (resData.resources) setResources(resData.resources);
        
      } catch (err) {
        console.error('Failed to fetch:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [isConnected, address]);

  const handleBuild = async (ship) => {
    if (!address || building) return;
    
    setBuilding(ship.shipType);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch(`${API_BASE}/ships/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerAddress: address,
          shipType: ship.shipType,
          quantity: buildQty,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to build');
      }
      
      setSuccess(`Building ${buildQty}x ${ship.name}!`);
      setBuildQty(1);
      
      // Refresh data
      const shipRes = await fetch(`${API_BASE}/ships/${address}`);
      const shipData = await shipRes.json();
      if (shipData.ships) setShips(shipData.ships);
      
      const resRes = await fetch(ENDPOINTS.resources(address));
      const resData = await resRes.json();
      if (resData.resources) setResources(resData.resources);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setBuilding(null);
    }
  };

  const canAfford = (ship, qty = 1) => {
    if (!ship.cost) return false;
    return (
      (resources.metal || 0) >= (ship.cost.metal || 0) * qty &&
      (resources.crystal || 0) >= (ship.cost.crystal || 0) * qty &&
      (resources.deuterium || 0) >= (ship.cost.deuterium || 0) * qty
    );
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getTimeRemaining = (completesAt) => {
    if (!completesAt) return null;
    const remaining = Math.max(0, Math.floor((new Date(completesAt) - Date.now()) / 1000));
    return formatTime(remaining);
  };

  // Calculate fleet summary
  const totalShips = ships.reduce((sum, s) => sum + (s.quantity || 0), 0);
  const totalAttack = ships.reduce((sum, s) => sum + (s.stats?.attack || 0) * (s.quantity || 0), 0);
  const totalShields = ships.reduce((sum, s) => sum + (s.stats?.shields || 0) * (s.quantity || 0), 0);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Rocket className="w-16 h-16 mx-auto mb-4 text-slate-500" />
          <h2 className="text-xl font-bold text-slate-300">Connect Wallet</h2>
          <p className="text-slate-500 mt-2">Connect your wallet to manage your fleet</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Shipyard</h1>
        <p className="text-slate-400 text-sm sm:text-base">Build and manage your fleet</p>
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
            <div className="text-xs sm:text-sm text-slate-400">Fleet Power</div>
            <div className="text-base sm:text-lg font-bold text-red-400">{(totalAttack + totalShields).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Fleet Summary */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-bold text-slate-100 mb-2 sm:mb-3">Fleet Summary</h2>
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
          <div>
            <Rocket className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 text-sky-400" />
            <div className="text-lg sm:text-2xl font-bold text-slate-100">{totalShips}</div>
            <div className="text-xs sm:text-sm text-slate-500">Total Ships</div>
          </div>
          <div>
            <Crosshair className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 text-red-400" />
            <div className="text-lg sm:text-2xl font-bold text-slate-100">{totalAttack.toLocaleString()}</div>
            <div className="text-xs sm:text-sm text-slate-500">Attack Power</div>
          </div>
          <div>
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 text-blue-400" />
            <div className="text-lg sm:text-2xl font-bold text-slate-100">{totalShields.toLocaleString()}</div>
            <div className="text-xs sm:text-sm text-slate-500">Shield Power</div>
          </div>
        </div>
      </div>

      {/* Messages */}
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
      <div className="bg-sky-900/20 border border-sky-700/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex items-start gap-2 sm:gap-3">
          <Info className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sky-300 font-medium text-sm sm:text-base">Building Ships</p>
            <p className="text-sky-400/80 text-xs sm:text-sm mt-1">
              Ships require a Shipyard facility. Higher shipyard levels unlock more ship types and reduce build times.
              Ships consume deuterium when traveling.
            </p>
          </div>
        </div>
      </div>

      {/* Ship Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {ships.map(ship => {
          const affordable = canAfford(ship, buildQty);
          const isBuilding = building === ship.shipType;
          const timeRemaining = getTimeRemaining(ship.buildCompletesAt);
          
          return (
            <div
              key={ship.id}
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 sm:p-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div>
                  <h3 className="font-bold text-slate-100 text-sm sm:text-base">{ship.name}</h3>
                  <span className="text-xs sm:text-sm text-slate-500">Owned: {ship.quantity}</span>
                </div>
                {ship.isBuilding && (
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {ship.building}x ({timeRemaining})
                  </span>
                )}
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-2 sm:mb-3 text-xs">
                <div className="bg-slate-700/50 rounded p-1.5 sm:p-2 text-center">
                  <Crosshair className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-1 text-red-400" />
                  <div className="text-slate-300 text-xs sm:text-sm">{ship.stats?.attack}</div>
                </div>
                <div className="bg-slate-700/50 rounded p-1.5 sm:p-2 text-center">
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-1 text-blue-400" />
                  <div className="text-slate-300 text-xs sm:text-sm">{ship.stats?.shields}</div>
                </div>
                <div className="bg-slate-700/50 rounded p-1.5 sm:p-2 text-center">
                  <Package className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-1 text-green-400" />
                  <div className="text-slate-300 text-xs sm:text-sm">{ship.stats?.cargo}</div>
                </div>
              </div>
              
              {/* Cost */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                {ship.cost && Object.entries(ship.cost).filter(([,v]) => v > 0).map(([resource, amount]) => (
                  <span
                    key={resource}
                    className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded ${
                      (resources[resource] || 0) >= amount * buildQty
                        ? 'bg-slate-700 text-slate-300'
                        : 'bg-red-900/30 text-red-400'
                    }`}
                  >
                    {resource}: {(amount * buildQty).toLocaleString()}
                  </span>
                ))}
              </div>
              
              {/* Build Controls */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime((ship.buildTime || 60) * buildQty)}
                  </span>
                  <select
                    value={buildQty}
                    onChange={(e) => setBuildQty(parseInt(e.target.value))}
                    className="bg-slate-700 border border-slate-600 rounded px-2 py-1.5 min-h-[36px] text-xs text-slate-300"
                  >
                    <option value={1}>×1</option>
                    <option value={5}>×5</option>
                    <option value={10}>×10</option>
                    <option value={25}>×25</option>
                  </select>
                </div>
                <button
                  onClick={() => handleBuild(ship)}
                  disabled={!affordable || isBuilding || ship.isBuilding}
                  className={`flex items-center gap-1 px-3 py-2 min-h-[44px] rounded text-sm font-medium transition ${
                    affordable && !ship.isBuilding
                      ? 'bg-sky-600 hover:bg-sky-500 active:bg-sky-400 text-white'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isBuilding ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Rocket className="w-4 h-4" />
                  )}
                  Build
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
