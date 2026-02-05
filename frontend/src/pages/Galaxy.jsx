import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Globe, User, Shield, Rocket, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAccount } from 'wagmi';

const API_BASE = 'https://expenditures-elimination-together-proposals.trycloudflare.com/api';

export function Galaxy() {
  const { address, isConnected } = useAccount();
  const [coordinates, setCoordinates] = useState({ galaxy: 1, system: 1, position: null });
  const [systemData, setSystemData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch system data from API
  useEffect(() => {
    async function fetchSystemData() {
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
        // Set empty data on error
        setSystemData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSystemData();
  }, [coordinates.galaxy, coordinates.system]);

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
    // Trigger re-fetch by updating a dependency
    setCoordinates(prev => ({ ...prev }));
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
              <Globe className="w-8 h-8 text-sky-400" />
              GALAXY MAP
            </h1>
            <p className="text-gray-400 mt-1">
              Explore the universe and find your next conquest
            </p>
          </div>
          
          {/* Search */}
          <div className="flex items-center gap-2 bg-black/50 border border-white/10 rounded px-4 py-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search player or coordinates..."
              className="bg-transparent text-white outline-none w-48"
            />
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="panel p-4 mb-6">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {/* Galaxy Selector */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Galaxy:</span>
              <button onClick={() => navigateGalaxy(-1)} className="p-2 hover:bg-white/10 rounded" disabled={coordinates.galaxy <= 1}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-sky-400 w-8 text-center">{coordinates.galaxy}</span>
              <button onClick={() => navigateGalaxy(1)} className="p-2 hover:bg-white/10 rounded" disabled={coordinates.galaxy >= 9}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            {/* System Selector */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">System:</span>
              <button onClick={() => navigateSystem(-10)} className="p-2 hover:bg-white/10 rounded text-xs" disabled={coordinates.system <= 10}>-10</button>
              <button onClick={() => navigateSystem(-1)} className="p-2 hover:bg-white/10 rounded" disabled={coordinates.system <= 1}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <input
                type="number"
                value={coordinates.system}
                onChange={(e) => setCoordinates(prev => ({ ...prev, system: Math.max(1, Math.min(499, parseInt(e.target.value) || 1)) }))}
                className="font-mono text-sky-400 bg-black/30 border border-white/10 rounded w-16 text-center py-1"
              />
              <button onClick={() => navigateSystem(1)} className="p-2 hover:bg-white/10 rounded" disabled={coordinates.system >= 499}>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={() => navigateSystem(10)} className="p-2 hover:bg-white/10 rounded text-xs" disabled={coordinates.system >= 489}>+10</button>
            </div>
            
            <div className="font-mono text-white">
              [{coordinates.galaxy}:{coordinates.system}]
            </div>

            {/* Refresh Button */}
            <button 
              onClick={refreshData}
              className="p-2 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Failed to load galaxy data: {error}
          </div>
        )}

        {/* System View */}
        <div className="panel overflow-hidden">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-2 p-4 bg-black/30 border-b border-white/10 text-xs text-gray-400 uppercase">
            <div className="col-span-1">Pos</div>
            <div className="col-span-3">Planet</div>
            <div className="col-span-2">Owner</div>
            <div className="col-span-2">Alliance</div>
            <div className="col-span-4 text-right">Actions</div>
          </div>
          
          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
              <span className="ml-3 text-gray-400">Scanning system...</span>
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
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12 text-gray-500">
              <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No planets found in this system</p>
              <p className="text-sm">Try exploring a different system</p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-6 mt-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full" />
            <span>Your Colony</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-sky-600 rounded-full" />
            <span>Colonizable</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full" />
            <span>Enemy</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-purple-500 rounded-full" />
            <span>AI Agent</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span>Debris Field</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanetRow({ planet, galaxy, system, userAddress }) {
  if (planet.type === 'empty') {
    return (
      <div className="grid grid-cols-12 gap-2 p-4 text-gray-500 items-center">
        <div className="col-span-1 font-mono">{planet.position}</div>
        <div className="col-span-11 text-sm italic">— Empty space —</div>
      </div>
    );
  }

  if (planet.type === 'debris') {
    return (
      <div className="grid grid-cols-12 gap-2 p-4 items-center bg-yellow-500/5">
        <div className="col-span-1 font-mono text-yellow-400">{planet.position}</div>
        <div className="col-span-3 flex items-center gap-2">
          <span className="text-yellow-400">💥</span>
          <span className="text-yellow-400">Debris Field</span>
        </div>
        <div className="col-span-4 text-gray-400">—</div>
        <div className="col-span-4 text-right">
          <button className="px-3 py-1 text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 rounded hover:bg-yellow-500/30">
            Salvage
          </button>
        </div>
      </div>
    );
  }

  // Check ownership
  const isYours = planet.ownerAddress && userAddress && 
    planet.ownerAddress.toLowerCase() === userAddress.toLowerCase();
  const isEnemy = planet.owner && !isYours;
  const isAI = planet.isAI;
  const isColonizable = !planet.owner;

  return (
    <div className={`grid grid-cols-12 gap-2 p-4 items-center transition-colors ${
      isYours ? 'bg-green-500/10' : isEnemy ? 'hover:bg-red-500/5' : 'hover:bg-white/5'
    }`}>
      <div className={`col-span-1 font-mono ${isYours ? 'text-green-400' : isAI ? 'text-purple-400' : 'text-white'}`}>
        {planet.position}
      </div>
      <div className="col-span-3 flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full ${
          isYours ? 'bg-green-500' : isAI ? 'bg-purple-500' : isColonizable ? 'bg-sky-600' : 'bg-red-500'
        }`} />
        <span className={isYours ? 'text-green-400 font-medium' : 'text-white'}>{planet.name || 'Unknown Planet'}</span>
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
      <div className="col-span-2">
        {planet.alliance ? (
          <span className="px-2 py-1 text-xs bg-white/10 rounded">{planet.alliance}</span>
        ) : (
          <span className="text-gray-500">—</span>
        )}
      </div>
      <div className="col-span-4 flex justify-end gap-2">
        {isYours ? (
          <span className="text-green-400 text-sm">Your Colony</span>
        ) : isColonizable ? (
          <button className="px-3 py-1 text-xs bg-sky-600/20 text-sky-400 border border-sky-600/50 rounded hover:bg-sky-600/30">
            Colonize
          </button>
        ) : (
          <>
            <button className="px-3 py-1 text-xs bg-white/10 text-gray-300 border border-white/20 rounded hover:bg-white/20">
              Spy
            </button>
            <button className="px-3 py-1 text-xs bg-red-500/20 text-red-400 border border-red-500/50 rounded hover:bg-red-500/30">
              Attack
            </button>
          </>
        )}
      </div>
    </div>
  );
}
