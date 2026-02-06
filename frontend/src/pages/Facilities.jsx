import React, { useState, useEffect } from 'react';
import { Building2, Zap, Clock, ArrowUp, Lock, Info, Loader2, CheckCircle } from 'lucide-react';
import { useAccount } from 'wagmi';
import { ENDPOINTS, toFrontendResources } from '../config/api';

// Mapping from backend facility types to frontend display
const FACILITY_INFO = {
  'metal_mine': { name: 'Metal Mine', icon: '⛏️', category: 'production', description: 'Extracts raw metal from asteroid fields' },
  'crystal_refinery': { name: 'Crystal Refinery', icon: '💎', category: 'production', description: 'Processes raw crystals into usable materials' },
  'deuterium_synthesizer': { name: 'Deuterium Synthesizer', icon: '🔮', category: 'production', description: 'Generates deuterium from stellar radiation' },
  'solar_plant': { name: 'Solar Plant', icon: '☀️', category: 'energy', description: 'Harnesses solar energy' },
  'fusion_reactor': { name: 'Fusion Reactor', icon: '⚛️', category: 'energy', description: 'High-output fusion power' },
  'robotics_factory': { name: 'Robotics Factory', icon: '🤖', category: 'military', description: 'Speeds up construction' },
  'shipyard': { name: 'Shipyard', icon: '🚀', category: 'military', description: 'Constructs vessels and fleet units' },
  'research_lab': { name: 'Research Lab', icon: '🔬', category: 'military', description: 'Enables technology research' },
  'missile_silo': { name: 'Missile Silo', icon: '🎯', category: 'military', description: 'Stores and launches missiles' },
  'nanite_factory': { name: 'Nanite Factory', icon: '🧬', category: 'special', description: 'Advanced construction nanobots' },
};

const CATEGORIES = [
  { id: 'production', name: 'Resource Production', icon: <Building2 className="w-4 h-4" /> },
  { id: 'energy', name: 'Energy', icon: <Zap className="w-4 h-4" /> },
  { id: 'military', name: 'Military', icon: <Building2 className="w-4 h-4" /> },
  { id: 'special', name: 'Special', icon: <Building2 className="w-4 h-4" /> },
];

export function Facilities() {
  const { address, isConnected } = useAccount();
  const [selectedCategory, setSelectedCategory] = useState('production');
  const [facilities, setFacilities] = useState([]);
  const [resources, setResources] = useState({ metal: 500, crystal: 500, deuterium: 0, energy: 0 });
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [countdowns, setCountdowns] = useState({}); // Track live countdowns

  // Real-time countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdowns(prev => {
        const newCountdowns = { ...prev };
        let hasChanges = false;
        
        facilities.forEach(f => {
          if (f.isUpgrading && f.upgradeCompletesAt) {
            const now = Date.now();
            const completesAt = new Date(f.upgradeCompletesAt).getTime();
            const remaining = Math.max(0, Math.floor((completesAt - now) / 1000));
            
            if (newCountdowns[f.id] !== remaining) {
              newCountdowns[f.id] = remaining;
              hasChanges = true;
            }
            
            // Refresh data when timer hits 0
            if (remaining === 0 && prev[f.id] > 0) {
              fetchData();
            }
          }
        });
        
        return hasChanges ? newCountdowns : prev;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [facilities]);

  const fetchData = async () => {
    if (!isConnected || !address) return;
    
    try {
      const facRes = await fetch(ENDPOINTS.facilities(address));
      const facData = await facRes.json();
      
      const resRes = await fetch(ENDPOINTS.resources(address));
      const resData = await resRes.json();
      
      if (facData.facilities) {
        setFacilities(facData.facilities);
        // Initialize countdowns
        const initialCountdowns = {};
        facData.facilities.forEach(f => {
          if (f.isUpgrading && f.upgradeCompletesAt) {
            const remaining = Math.max(0, Math.floor((new Date(f.upgradeCompletesAt).getTime() - Date.now()) / 1000));
            initialCountdowns[f.id] = remaining;
          }
        });
        setCountdowns(initialCountdowns);
      }
      if (resData.resources) {
        setResources(resData.resources);
      }
    } catch (err) {
      console.error('Failed to fetch:', err);
    }
  };

  // Fetch facilities and resources
  useEffect(() => {
    if (!isConnected || !address) {
      setLoading(false);
      return;
    }

    const doFetch = async () => {
      try {
        setLoading(true);
        await fetchData();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    doFetch();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [isConnected, address]);

  const handleBuild = async (facility) => {
    if (!address || building) return;
    
    setBuilding(facility.facilityType);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch(ENDPOINTS.buildFacility(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerAddress: address,
          facilityType: facility.facilityType,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to build');
      }
      
      setSuccess(`${FACILITY_INFO[facility.facilityType]?.name || facility.facilityType} upgrade started!`);
      
      // Refresh data
      const facRes = await fetch(ENDPOINTS.facilities(address));
      const facData = await facRes.json();
      if (facData.facilities) setFacilities(facData.facilities);
      
      const resRes = await fetch(ENDPOINTS.resources(address));
      const resData = await resRes.json();
      if (resData.resources) setResources(resData.resources);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setBuilding(null);
    }
  };

  const canAfford = (facility) => {
    if (!facility.upgradeCost) return false;
    return Object.entries(facility.upgradeCost).every(([resource, amount]) => 
      (resources[resource] || 0) >= amount
    );
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const filteredFacilities = facilities.filter(f => 
    FACILITY_INFO[f.facilityType]?.category === selectedCategory
  );

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
        <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Facilities</h1>
        <p className="text-slate-400 text-sm sm:text-base">Build and upgrade structures to increase production</p>
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

      {/* Category Tabs */}
      <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 min-h-[44px] rounded-lg font-medium transition whitespace-nowrap text-sm sm:text-base ${
              selectedCategory === cat.id
                ? 'bg-sky-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 active:bg-slate-600'
            }`}
          >
            {cat.icon}
            <span className="hidden xs:inline sm:inline">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Facility Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredFacilities.map(facility => {
          const info = FACILITY_INFO[facility.facilityType] || {};
          const affordable = canAfford(facility);
          const isBuilding = building === facility.facilityType;
          const isUpgrading = facility.isUpgrading;
          
          return (
            <div
              key={facility.id}
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 sm:p-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-2xl sm:text-3xl">{info.icon || '🏗️'}</span>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm sm:text-base">{info.name || facility.facilityType}</h3>
                    <span className="text-xs sm:text-sm text-slate-500">Level {facility.level || 0}</span>
                  </div>
                </div>
                {isUpgrading && (
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {countdowns[facility.id] !== undefined ? formatTime(countdowns[facility.id]) : 'Upgrading...'}
                  </span>
                )}
              </div>
              
              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-400 mb-2 sm:mb-3">{info.description || ''}</p>
              
              {/* Production */}
              {facility.production && Object.keys(facility.production).length > 0 && (
                <div className="text-xs sm:text-sm text-green-400 mb-2">
                  Production: {Object.entries(facility.production).map(([k, v]) => `+${v} ${k}`).join(', ')}
                </div>
              )}
              
              {/* Upgrade Cost */}
              {facility.upgradeCost && (
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                  {Object.entries(facility.upgradeCost).map(([resource, amount]) => (
                    <span
                      key={resource}
                      className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded ${
                        (resources[resource] || 0) >= amount
                          ? 'bg-slate-700 text-slate-300'
                          : 'bg-red-900/30 text-red-400'
                      }`}
                    >
                      {resource}: {amount.toLocaleString()}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Build Button */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(facility.upgradeTime || 60)}
                </span>
                <button
                  onClick={() => handleBuild(facility)}
                  disabled={!affordable || isBuilding || isUpgrading}
                  className={`flex items-center gap-1 px-3 py-2 min-h-[44px] rounded text-sm font-medium transition ${
                    affordable && !isUpgrading
                      ? 'bg-sky-600 hover:bg-sky-500 active:bg-sky-400 text-white'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isBuilding ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowUp className="w-4 h-4" />
                  )}
                  {isUpgrading ? 'Upgrading' : facility.level === 0 ? 'Build' : 'Upgrade'}
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
