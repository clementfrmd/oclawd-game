import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Globe, User, Shield, Rocket } from 'lucide-react';

export function Galaxy() {
  const [coordinates, setCoordinates] = useState({ galaxy: 1, system: 45, position: null });
  
  // Mock galaxy data
  const systemData = [
    { position: 1, type: 'planet', owner: null, name: 'Desolate World' },
    { position: 2, type: 'empty', owner: null },
    { position: 3, type: 'planet', owner: 'Commander_X', name: 'Nova Prime', alliance: 'VDC' },
    { position: 4, type: 'planet', owner: null, name: 'Rocky Outpost' },
    { position: 5, type: 'empty', owner: null },
    { position: 6, type: 'planet', owner: null, name: 'Gas Giant IV' },
    { position: 7, type: 'planet', owner: 'YOU', name: 'Alpha Prime', isYours: true },
    { position: 8, type: 'planet', owner: 'Zerg_Rush', name: 'Hive World', alliance: 'SWM' },
    { position: 9, type: 'debris', owner: null },
    { position: 10, type: 'planet', owner: null, name: 'Frozen Moon' },
    { position: 11, type: 'empty', owner: null },
    { position: 12, type: 'planet', owner: 'AI_Agent_7', name: 'Neural Hub', isAI: true },
    { position: 13, type: 'planet', owner: null, name: 'Desert World' },
    { position: 14, type: 'empty', owner: null },
    { position: 15, type: 'planet', owner: 'WarLord99', name: 'Fortress Prime', alliance: 'DRK' },
  ];

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

  return (
    <div className="min-h-screen relative">
      <div className="stars-bg" />
      <div className="nebula" />
      
      <div className="relative max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
              <Globe className="w-8 h-8 text-accent" />
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
              <button onClick={() => navigateGalaxy(-1)} className="p-2 hover:bg-white/10 rounded">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-accent w-8 text-center">{coordinates.galaxy}</span>
              <button onClick={() => navigateGalaxy(1)} className="p-2 hover:bg-white/10 rounded">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            {/* System Selector */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">System:</span>
              <button onClick={() => navigateSystem(-10)} className="p-2 hover:bg-white/10 rounded text-xs">-10</button>
              <button onClick={() => navigateSystem(-1)} className="p-2 hover:bg-white/10 rounded">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <input
                type="number"
                value={coordinates.system}
                onChange={(e) => setCoordinates(prev => ({ ...prev, system: Math.max(1, Math.min(499, parseInt(e.target.value) || 1)) }))}
                className="font-mono text-accent bg-black/30 border border-white/10 rounded w-16 text-center py-1"
              />
              <button onClick={() => navigateSystem(1)} className="p-2 hover:bg-white/10 rounded">
                <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={() => navigateSystem(10)} className="p-2 hover:bg-white/10 rounded text-xs">+10</button>
            </div>
            
            <div className="font-mono text-white">
              [{coordinates.galaxy}:{coordinates.system}]
            </div>
          </div>
        </div>

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
          
          {/* Planet Rows */}
          <div className="divide-y divide-white/5">
            {systemData.map((planet) => (
              <PlanetRow
                key={planet.position}
                planet={planet}
                galaxy={coordinates.galaxy}
                system={coordinates.system}
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-6 mt-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full" />
            <span>Your Colony</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-cyan-500 rounded-full" />
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

function PlanetRow({ planet, galaxy, system }) {
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

  const isYours = planet.isYours;
  const isEnemy = planet.owner && !planet.isYours;
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
          isYours ? 'bg-green-500' : isAI ? 'bg-purple-500' : isColonizable ? 'bg-cyan-500' : 'bg-red-500'
        }`} />
        <span className={isYours ? 'text-green-400 font-medium' : 'text-white'}>{planet.name}</span>
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
          <button className="px-3 py-1 text-xs bg-cyan-500/20 text-accent border border-cyan-500/50 rounded hover:bg-cyan-500/30">
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
