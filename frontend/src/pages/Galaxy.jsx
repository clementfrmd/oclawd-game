import React, { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, Globe, User, Shield, Rocket, Loader2, AlertTriangle, RefreshCw, Ship, Home } from 'lucide-react';
import { useAccount } from 'wagmi';

const API_BASE = 'https://expenditures-elimination-together-proposals.trycloudflare.com/api';

export function Galaxy() {
  const { address, isConnected } = useAccount();
  const [coordinates, setCoordinates] = useState({ galaxy: 1, system: 1, position: null });
  const [systemData, setSystemData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playerShips, setPlayerShips] = useState({ colonyShips: 0 });
  const [colonizing, setColonizing] = useState(false);
  const [colonizeMessage, setColonizeMessage] = useState(null);

  // Fetch system data from API
  const fetchSystemData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`${API_BASE}/galaxy?galaxy=${coordinates.galaxy}&system=${coordinates.system}`);
      
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      
      const data = await res.json();
      setSystemData(data.planets || []);
    } catch (err) {
      console.error('Failed to fetch galaxy data:', err);
      setError(err.message);
      setSystemData([]);
    } finally {
      setLoading(false);
    }
  }, [coordinates.galaxy, coordinates.system]);

  // Fetch player ships for colonization
  const fetchPlayerShips = useCallback(async () => {
    if (!address) return;
    try {
      const res = await fetch(`${API_BASE}/colonies/ships/${address}`);
      if (res.ok) {
        const data = await res.json();
        setPlayerShips(data);
      }
    } catch (err) {
      console.error('Failed to fetch player ships:', err);
    }
  }, [address]);

  useEffect(() => {
    fetchSystemData();
  }, [fetchSystemData]);

  useEffect(() => {
    fetchPlayerShips();
  }, [fetchPlayerShips]);

  const navigateSystem = (delta) => {
    setCoordinates(prev => ({
      ...prev,
      system: Math.max(1, Math.min(499, prev.system + delta))
    }));
  };

  const navigateGalaxy = (delta) => {
    setCoordinates(prev => ({
      ...prev,
      galaxy: Math.max(1, Math.min(9, prev.galaxy + delta))
    }));
  };

  const refreshData = () => {
    fetchSystemData();
    fetchPlayerShips();
  };

  // Handle colonization
  const handleColonize = async (position) => {
    if (!address) {
      setColonizeMessage({ type: 'error', text: 'Please connect your wallet to colonize' });
      return;
    }
    
    if (playerShips.colonyShips < 1) {
      setColonizeMessage({ type: 'error', text: 'No Colony Ships available! Build one in your Shipyard.' });
      return;
    }

    setColonizing(true);
    setColonizeMessage(null);

    try {
      const res = await fetch(`${API_BASE}/colonies/colonize`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Wallet-Address': address
        },
        body: JSON.stringify({
          playerAddress: address,
          galaxy: coordinates.galaxy,
          system: coordinates.system,
          position
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to colonize');
      }

      setColonizeMessage({ 
        type: 'success', 
        text: `Colony established at ${coordinates.galaxy}:${coordinates.system}:${position}!` 
      });
      
      // Refresh data
      fetchSystemData();
      fetchPlayerShips();
    } catch (err) {
      setColonizeMessage({ type: 'error', text: err.message });
    } finally {
      setColonizing(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="stars-bg" />
      <div className="nebula" />
      
      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 mb-4 sm:mb-8">
          <div>
            <h1 className="font-display text-xl sm:text-3xl md:text-4xl font-bold text-white flex items-center gap-2 sm:gap-3">
              <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-sky-400" />
              GALAXY MAP
            </h1>
            <p className="text-gray-400 mt-1 text-sm sm:text-base">
              Explore the universe and find your next conquest
            </p>
          </div>
          
          {/* Colony Ships Indicator */}
          {isConnected && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2 bg-sky-600/20 border border-sky-600/50 rounded px-3 sm:px-4 py-2 min-h-[44px]">
                <Ship className="w-4 h-4 text-sky-400" />
                <span className="text-sky-400 font-medium text-sm sm:text-base">{playerShips.colonyShips} Colony Ships</span>
              </div>
              
              {/* Search - hidden on mobile */}
              <div className="hidden sm:flex items-center gap-2 bg-black/50 border border-white/10 rounded px-4 py-2 min-h-[44px]">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search player or coordinates..."
                  className="bg-transparent text-white outline-none w-48"
                />
              </div>
            </div>
          )}
        </div>

        {/* Colonize Message */}
        {colonizeMessage && (
          <div className={`mb-4 p-3 sm:p-4 rounded flex items-start sm:items-center gap-2 ${
            colonizeMessage.type === 'success' 
              ? 'bg-green-500/20 border border-green-500/50 text-green-400'
              : 'bg-red-500/20 border border-red-500/50 text-red-400'
          }`}>
            {colonizeMessage.type === 'success' ? <Home className="w-4 h-4 flex-shrink-0 mt-0.5 sm:mt-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 sm:mt-0" />}
            <span className="text-sm sm:text-base flex-1">{colonizeMessage.text}</span>
            <button 
              onClick={() => setColonizeMessage(null)}
              className="text-sm opacity-70 hover:opacity-100 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        )}

        {/* Navigation Controls */}
        <div className="panel p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            {/* Galaxy Selector */}
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-gray-400 text-xs sm:text-sm">Galaxy:</span>
              <button onClick={() => navigateGalaxy(-1)} className="p-2 min-w-[44px] min-h-[44px] hover:bg-white/10 active:bg-white/20 rounded flex items-center justify-center" disabled={coordinates.galaxy <= 1}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-sky-400 w-6 sm:w-8 text-center">{coordinates.galaxy}</span>
              <button onClick={() => navigateGalaxy(1)} className="p-2 min-w-[44px] min-h-[44px] hover:bg-white/10 active:bg-white/20 rounded flex items-center justify-center" disabled={coordinates.galaxy >= 9}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            {/* System Selector */}
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-gray-400 text-xs sm:text-sm">System:</span>
              <button onClick={() => navigateSystem(-10)} className="p-2 min-w-[40px] min-h-[44px] hover:bg-white/10 active:bg-white/20 rounded text-xs hidden sm:flex items-center justify-center" disabled={coordinates.system <= 10}>-10</button>
              <button onClick={() => navigateSystem(-1)} className="p-2 min-w-[44px] min-h-[44px] hover:bg-white/10 active:bg-white/20 rounded flex items-center justify-center" disabled={coordinates.system <= 1}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <input
                type="number"
                value={coordinates.system}
                onChange={(e) => setCoordinates(prev => ({ ...prev, system: Math.max(1, Math.min(499, parseInt(e.target.value) || 1)) }))}
                className="font-mono text-sky-400 bg-black/30 border border-white/10 rounded w-14 sm:w-16 text-center py-2 min-h-[44px]"
              />
              <button onClick={() => navigateSystem(1)} className="p-2 min-w-[44px] min-h-[44px] hover:bg-white/10 active:bg-white/20 rounded flex items-center justify-center" disabled={coordinates.system >= 499}>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={() => navigateSystem(10)} className="p-2 min-w-[40px] min-h-[44px] hover:bg-white/10 active:bg-white/20 rounded text-xs hidden sm:flex items-center justify-center" disabled={coordinates.system >= 489}>+10</button>
            </div>
            
            <div className="font-mono text-white text-sm sm:text-base">
              [{coordinates.galaxy}:{coordinates.system}]
            </div>

            {/* Refresh Button */}
            <button 
              onClick={refreshData}
              className="p-2 min-w-[44px] min-h-[44px] hover:bg-white/10 active:bg-white/20 rounded text-gray-400 hover:text-white transition-colors flex items-center justify-center"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-3 sm:p-4 bg-red-500/20 border border-red-500/50 rounded text-red-400 flex items-start sm:items-center gap-2 text-sm sm:text-base">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 sm:mt-0" />
            <span>Failed to load galaxy data: {error}</span>
          </div>
        )}

        {/* System View */}
        <div className="panel overflow-hidden">
          {/* Header Row - Hidden on mobile */}
          <div className="hidden sm:grid grid-cols-12 gap-2 p-4 bg-black/30 border-b border-white/10 text-xs text-gray-400 uppercase">
            <div className="col-span-1">Pos</div>
            <div className="col-span-3">Planet</div>
            <div className="col-span-2">Owner</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-4 text-right">Actions</div>
          </div>
          
          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-sky-400 animate-spin" />
              <span className="ml-3 text-gray-400 text-sm sm:text-base">Scanning system...</span>
            </div>
          ) : systemData.length > 0 ? (
            /* Planet Rows */
            <div className="divide-y divide-white/5">
              {systemData.map((planet) => (
                <PlanetRow
                  key={planet.position}
                  planet={planet}
                  galaxy={coordinates.galaxy}
                  system={coordinates.system}
                  userAddress={address}
                  onColonize={handleColonize}
                  colonizing={colonizing}
                  hasColonyShip={playerShips.colonyShips > 0}
                  isConnected={isConnected}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-8 sm:py-12 text-gray-500">
              <Globe className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm sm:text-base">No planets found in this system</p>
              <p className="text-xs sm:text-sm">Try exploring a different system</p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 sm:gap-6 mt-4 sm:mt-6 text-xs sm:text-sm text-gray-400">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full" />
            <span>Your Colony</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-sky-600 rounded-full" />
            <span>Colonizable</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full" />
            <span>Enemy</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gray-600 rounded-full" />
            <span>Uninhabitable</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-yellow-500 rounded-full" />
            <span>Debris Field</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanetRow({ planet, galaxy, system, userAddress, onColonize, colonizing, hasColonyShip, isConnected }) {
  // Empty space
  if (planet.type === 'empty') {
    return (
      <>
        {/* Desktop view */}
        <div className="hidden sm:grid grid-cols-12 gap-2 p-4 text-gray-500 items-center">
          <div className="col-span-1 font-mono">{planet.position}</div>
          <div className="col-span-11 text-sm italic">— Empty space —</div>
        </div>
        {/* Mobile view */}
        <div className="sm:hidden p-3 text-gray-500 text-sm flex items-center gap-2">
          <span className="font-mono w-6">{planet.position}</span>
          <span className="italic">— Empty space —</span>
        </div>
      </>
    );
  }

  // Debris field
  if (planet.type === 'debris') {
    return (
      <>
        {/* Desktop view */}
        <div className="hidden sm:grid grid-cols-12 gap-2 p-4 items-center bg-yellow-500/5">
          <div className="col-span-1 font-mono text-yellow-400">{planet.position}</div>
          <div className="col-span-3 flex items-center gap-2">
            <span className="text-yellow-400">💥</span>
            <span className="text-yellow-400">Debris Field</span>
          </div>
          <div className="col-span-2 text-gray-400">—</div>
          <div className="col-span-2 text-xs text-yellow-400/70">
            {planet.metal?.toLocaleString()} M / {planet.crystal?.toLocaleString()} C
          </div>
          <div className="col-span-4 text-right">
            <button className="px-3 py-2 min-h-[44px] text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 rounded hover:bg-yellow-500/30">
              Salvage
            </button>
          </div>
        </div>
        {/* Mobile view */}
        <div className="sm:hidden p-3 bg-yellow-500/5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-yellow-400 w-6">{planet.position}</span>
              <span className="text-yellow-400">💥</span>
              <span className="text-yellow-400 text-sm">Debris Field</span>
            </div>
            <button className="px-3 py-2 min-h-[44px] text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 rounded active:bg-yellow-500/40">
              Salvage
            </button>
          </div>
          <div className="text-xs text-yellow-400/70 mt-1 ml-8">
            {planet.metal?.toLocaleString()} M / {planet.crystal?.toLocaleString()} C
          </div>
        </div>
      </>
    );
  }

  // Uninhabitable planet
  if (planet.type === 'uninhabitable') {
    return (
      <>
        {/* Desktop view */}
        <div className="hidden sm:grid grid-cols-12 gap-2 p-4 text-gray-500 items-center">
          <div className="col-span-1 font-mono">{planet.position}</div>
          <div className="col-span-3 flex items-center gap-2">
            <span className="w-3 h-3 bg-gray-600 rounded-full" />
            <span>{planet.name}</span>
          </div>
          <div className="col-span-2">—</div>
          <div className="col-span-2 text-xs capitalize">{planet.planetType?.replace('_', ' ')}</div>
          <div className="col-span-4 text-right text-xs">Uninhabitable</div>
        </div>
        {/* Mobile view */}
        <div className="sm:hidden p-3 text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-mono w-6">{planet.position}</span>
            <span className="w-2.5 h-2.5 bg-gray-600 rounded-full" />
            <span className="text-sm">{planet.name}</span>
          </div>
          <div className="text-xs ml-8 mt-1 capitalize">
            {planet.planetType?.replace('_', ' ')} • Uninhabitable
          </div>
        </div>
      </>
    );
  }

  // Colonizable planet
  if (planet.type === 'colonizable') {
    return (
      <>
        {/* Desktop view */}
        <div className="hidden sm:grid grid-cols-12 gap-2 p-4 items-center hover:bg-sky-500/5 transition-colors">
          <div className="col-span-1 font-mono text-sky-400">{planet.position}</div>
          <div className="col-span-3 flex items-center gap-2">
            <span className="w-3 h-3 bg-sky-600 rounded-full" />
            <span className="text-sky-300">{planet.name}</span>
          </div>
          <div className="col-span-2 text-gray-500">Unclaimed</div>
          <div className="col-span-2 text-xs text-sky-400/70 capitalize">{planet.planetType?.replace('_', ' ')}</div>
          <div className="col-span-4 text-right">
            {isConnected ? (
              <button 
                onClick={() => onColonize(planet.position)}
                disabled={colonizing || !hasColonyShip}
                className={`px-3 py-2 min-h-[44px] text-xs rounded transition-colors ${
                  hasColonyShip 
                    ? 'bg-sky-600/20 text-sky-400 border border-sky-600/50 hover:bg-sky-600/30'
                    : 'bg-gray-500/20 text-gray-500 border border-gray-500/30 cursor-not-allowed'
                }`}
                title={!hasColonyShip ? 'Build a Colony Ship first' : 'Colonize this planet'}
              >
                {colonizing ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Colonizing...
                  </span>
                ) : (
                  <>🚀 Colonize</>
                )}
              </button>
            ) : (
              <span className="text-xs text-gray-500">Connect wallet to colonize</span>
            )}
          </div>
        </div>
        {/* Mobile view */}
        <div className="sm:hidden p-3 active:bg-sky-500/10">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="font-mono text-sky-400 w-6">{planet.position}</span>
              <span className="w-2.5 h-2.5 bg-sky-600 rounded-full flex-shrink-0" />
              <span className="text-sky-300 text-sm truncate">{planet.name}</span>
            </div>
            {isConnected ? (
              <button 
                onClick={() => onColonize(planet.position)}
                disabled={colonizing || !hasColonyShip}
                className={`px-3 py-2 min-h-[44px] text-xs rounded transition-colors flex-shrink-0 ${
                  hasColonyShip 
                    ? 'bg-sky-600/20 text-sky-400 border border-sky-600/50 active:bg-sky-600/40'
                    : 'bg-gray-500/20 text-gray-500 border border-gray-500/30 cursor-not-allowed'
                }`}
              >
                {colonizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <>🚀 Colonize</>}
              </button>
            ) : null}
          </div>
          <div className="text-xs text-sky-400/70 ml-8 mt-1 capitalize">
            {planet.planetType?.replace('_', ' ')} • Unclaimed
          </div>
        </div>
      </>
    );
  }

  // Colony (owned planet)
  const isYours = planet.ownerAddress && userAddress && 
    planet.ownerAddress.toLowerCase() === userAddress.toLowerCase();
  const isEnemy = planet.owner && !isYours;
  const isAI = planet.isAI;

  return (
    <>
      {/* Desktop view */}
      <div className={`hidden sm:grid grid-cols-12 gap-2 p-4 items-center transition-colors ${
        isYours ? 'bg-green-500/10' : isEnemy ? 'hover:bg-red-500/5' : 'hover:bg-white/5'
      }`}>
        <div className={`col-span-1 font-mono ${isYours ? 'text-green-400' : isAI ? 'text-purple-400' : 'text-white'}`}>
          {planet.position}
        </div>
        <div className="col-span-3 flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            isYours ? 'bg-green-500' : isAI ? 'bg-purple-500' : 'bg-red-500'
          }`} />
          <span className={isYours ? 'text-green-400 font-medium' : 'text-white'}>
            {planet.name || 'Unknown Colony'}
          </span>
          {planet.isHomeworld && (
            <Home className="w-3 h-3 text-yellow-400" title="Homeworld" />
          )}
        </div>
        <div className="col-span-2 flex items-center gap-2">
          {planet.owner ? (
            <>
              {isAI ? <Rocket className="w-4 h-4 text-purple-400" /> : <User className="w-4 h-4 text-gray-400" />}
              <span className={isYours ? 'text-green-400' : isAI ? 'text-purple-400' : 'text-white'}>
                {isYours ? 'YOU' : planet.owner}
              </span>
            </>
          ) : (
            <span className="text-gray-500">—</span>
          )}
        </div>
        <div className="col-span-2 text-xs text-gray-400 capitalize">
          {planet.planetType?.replace('_', ' ')}
          {planet.fields && <span className="ml-1 opacity-60">({planet.fields} fields)</span>}
        </div>
        <div className="col-span-4 flex justify-end gap-2">
          {isYours ? (
            <span className="text-green-400 text-sm flex items-center gap-1">
              <Home className="w-4 h-4" />
              Your Colony
            </span>
          ) : (
            <>
              <button className="px-3 py-2 min-h-[44px] text-xs bg-white/10 text-gray-300 border border-white/20 rounded hover:bg-white/20">
                Spy
              </button>
              <button className="px-3 py-2 min-h-[44px] text-xs bg-red-500/20 text-red-400 border border-red-500/50 rounded hover:bg-red-500/30">
                Attack
              </button>
            </>
          )}
        </div>
      </div>
      {/* Mobile view */}
      <div className={`sm:hidden p-3 ${
        isYours ? 'bg-green-500/10' : isEnemy ? 'active:bg-red-500/10' : 'active:bg-white/5'
      }`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className={`font-mono w-6 ${isYours ? 'text-green-400' : isAI ? 'text-purple-400' : 'text-white'}`}>
              {planet.position}
            </span>
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
              isYours ? 'bg-green-500' : isAI ? 'bg-purple-500' : 'bg-red-500'
            }`} />
            <span className={`text-sm truncate ${isYours ? 'text-green-400 font-medium' : 'text-white'}`}>
              {planet.name || 'Unknown Colony'}
            </span>
            {planet.isHomeworld && (
              <Home className="w-3 h-3 text-yellow-400 flex-shrink-0" />
            )}
          </div>
          {isYours ? (
            <span className="text-green-400 text-xs flex items-center gap-1 flex-shrink-0">
              <Home className="w-3 h-3" />
              Yours
            </span>
          ) : (
            <div className="flex gap-1 flex-shrink-0">
              <button className="px-2 py-2 min-h-[44px] text-xs bg-white/10 text-gray-300 border border-white/20 rounded active:bg-white/30">
                Spy
              </button>
              <button className="px-2 py-2 min-h-[44px] text-xs bg-red-500/20 text-red-400 border border-red-500/50 rounded active:bg-red-500/40">
                Attack
              </button>
            </div>
          )}
        </div>
        <div className="text-xs text-gray-400 ml-8 mt-1">
          <span className={isYours ? 'text-green-400' : isAI ? 'text-purple-400' : ''}>
            {isYours ? 'YOU' : planet.owner}
          </span>
          <span className="mx-1">•</span>
          <span className="capitalize">{planet.planetType?.replace('_', ' ')}</span>
          {planet.fields && <span className="opacity-60"> ({planet.fields} fields)</span>}
        </div>
      </div>
    </>
  );
}
