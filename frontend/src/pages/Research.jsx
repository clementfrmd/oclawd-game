import React, { useState, useEffect } from 'react';
import { FlaskConical, Zap, Clock, ArrowUp, Lock, Info, Crosshair, Shield, Rocket, Loader2, CheckCircle, X } from 'lucide-react';
import { useAccount } from 'wagmi';
import { ENDPOINTS, toFrontendResources } from '../config/api';

// Technology definitions from game design
const TECHNOLOGIES = [
  // Combat
  { id: 'weapons-systems', name: 'Weapons Systems', category: 'combat', description: 'Increases all weapon damage by 10% per level', baseCost: { metal: 800, crystal: 200 }, bonus: '+10% damage', maxLevel: 20, icon: <Crosshair className="w-6 h-6" />, requires: 'weapons-lab' },
  { id: 'armor-plating', name: 'Armor Plating', category: 'combat', description: 'Increases hull strength by 10% per level', baseCost: { metal: 1000, crystal: 300 }, bonus: '+10% hull', maxLevel: 20, icon: <Shield className="w-6 h-6" />, requires: 'weapons-lab' },
  { id: 'shield-technology', name: 'Shield Technology', category: 'combat', description: 'Increases shield capacity by 10% per level', baseCost: { metal: 200, crystal: 600 }, bonus: '+10% shields', maxLevel: 20, icon: <Shield className="w-6 h-6" />, requires: 'weapons-lab' },
  { id: 'targeting-systems', name: 'Targeting Systems', category: 'combat', description: 'Increases critical hit chance', baseCost: { metal: 400, crystal: 800, deuterium: 200 }, bonus: '+5% crit', maxLevel: 15, icon: <Crosshair className="w-6 h-6" />, requires: 'weapons-lab' },
  
  // Propulsion
  { id: 'combustion-drive', name: 'Combustion Drive', category: 'propulsion', description: 'Basic propulsion for light vessels', baseCost: { metal: 400, crystal: 600 }, bonus: 'Base speed', maxLevel: 10, icon: <Rocket className="w-6 h-6" />, requires: 'research-nexus' },
  { id: 'impulse-drive', name: 'Impulse Drive', category: 'propulsion', description: 'Advanced propulsion for medium vessels', baseCost: { metal: 2000, crystal: 4000, deuterium: 600 }, bonus: '2x speed', maxLevel: 15, icon: <Rocket className="w-6 h-6" />, requires: 'research-nexus' },
  { id: 'hyperspace-drive', name: 'Hyperspace Drive', category: 'propulsion', description: 'FTL travel for capital ships', baseCost: { metal: 10000, crystal: 20000, deuterium: 6000 }, bonus: '10x speed', maxLevel: 12, icon: <Rocket className="w-6 h-6" />, requires: 'research-nexus' },
  
  // Economy
  { id: 'mining-efficiency', name: 'Mining Efficiency', category: 'economy', description: 'Increases ore production by 5% per level', baseCost: { metal: 200, crystal: 100 }, bonus: '+5% ore', maxLevel: 25, icon: <FlaskConical className="w-6 h-6" />, requires: 'research-nexus' },
  { id: 'crystal-synthesis', name: 'Crystal Synthesis', category: 'economy', description: 'Increases crystal production by 5% per level', baseCost: { metal: 200, crystal: 300 }, bonus: '+5% crystal', maxLevel: 25, icon: <FlaskConical className="w-6 h-6" />, requires: 'research-nexus' },
  { id: 'plasma-refining', name: 'Plasma Refining', category: 'economy', description: 'Increases plasma production by 5% per level', baseCost: { metal: 400, crystal: 400, deuterium: 200 }, bonus: '+5% plasma', maxLevel: 20, icon: <FlaskConical className="w-6 h-6" />, requires: 'research-nexus' },
  { id: 'energy-optimization', name: 'Energy Optimization', category: 'economy', description: 'Reduces energy consumption by 3% per level', baseCost: { metal: 500, crystal: 500 }, bonus: '-3% energy', maxLevel: 20, icon: <Zap className="w-6 h-6" />, requires: 'research-nexus' },
  
  // Special
  { id: 'espionage', name: 'Espionage Technology', category: 'special', description: 'Improves spy probe capabilities', baseCost: { metal: 200, crystal: 1000 }, bonus: '+intel', maxLevel: 15, icon: <FlaskConical className="w-6 h-6" />, requires: 'research-nexus' },
  { id: 'graviton', name: 'Graviton Technology', category: 'special', description: 'Required for Titan-class vessels', baseCost: { metal: 0, crystal: 0, deuterium: 0 }, bonus: 'Unlocks Titans', maxLevel: 1, special: 'Requires massive energy', icon: <FlaskConical className="w-6 h-6" />, requires: 'research-nexus' },
  { id: 'void-harmonics', name: 'Void Harmonics', category: 'special', description: 'Harness the power of the void', baseCost: { metal: 50000, crystal: 50000, deuterium: 25000 }, bonus: '$VOID boost', maxLevel: 10, icon: <FlaskConical className="w-6 h-6" />, requires: 'research-nexus' },
];

const CATEGORIES = [
  { id: 'combat', name: 'Combat', icon: <Crosshair className="w-4 h-4" /> },
  { id: 'propulsion', name: 'Propulsion', icon: <Rocket className="w-4 h-4" /> },
  { id: 'economy', name: 'Economy', icon: <FlaskConical className="w-4 h-4" /> },
  { id: 'special', name: 'Special', icon: <FlaskConical className="w-4 h-4" /> },
];

// Map frontend resource names for display
const RESOURCE_DISPLAY = {
  metal: 'Metal',
  crystal: 'Crystal',
  deuterium: 'Deuterium',
};

export function Research() {
  const { address, isConnected } = useAccount();
  const [selectedCategory, setSelectedCategory] = useState('combat');
  const [selectedTech, setSelectedTech] = useState(null);
  const [playerResearch, setPlayerResearch] = useState({});
  const [resources, setResources] = useState({ metal: 0, crystal: 0, deuterium: 0, energy: 0 });
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [researching, setResearching] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeResearch, setActiveResearch] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  // Fetch research data and resources
  useEffect(() => {
    if (!isConnected || !address) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch research levels
        const researchRes = await fetch(ENDPOINTS.research(address));
        const researchData = await researchRes.json();
        
        // Fetch resources
        const resourcesRes = await fetch(ENDPOINTS.resources(address));
        const resourcesData = await resourcesRes.json();
        
        // Fetch facilities (for requirements check)
        const facilitiesRes = await fetch(ENDPOINTS.facilities(address));
        const facilitiesData = await facilitiesRes.json();
        
        if (researchData.research) {
          // Convert array to object keyed by tech type
          const researchLevels = {};
          let currentResearch = null;
          
          researchData.research.forEach(r => {
            researchLevels[r.techType] = r.level || 0;
            if (r.isResearching && r.completesAt) {
              currentResearch = {
                techType: r.techType,
                completesAt: new Date(r.completesAt).getTime(),
              };
            }
          });
          
          setPlayerResearch(researchLevels);
          setActiveResearch(currentResearch);
        }
        
        if (resourcesData.resources) {
          setResources(resourcesData.resources);
        }
        
        if (facilitiesData.facilities) {
          setFacilities(facilitiesData.facilities);
        }
      } catch (err) {
        console.error('Failed to fetch research data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [isConnected, address]);

  // Update time remaining countdown
  useEffect(() => {
    if (!activeResearch) {
      setTimeRemaining(0);
      return;
    }

    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((activeResearch.completesAt - Date.now()) / 1000));
      setTimeRemaining(remaining);
      
      // If completed, refresh data
      if (remaining === 0) {
        setActiveResearch(null);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [activeResearch]);

  const handleResearch = async (tech) => {
    if (!address || researching || activeResearch) return;
    
    setResearching(tech.id);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch(ENDPOINTS.startResearch(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerAddress: address,
          techType: tech.id,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to start research');
      }
      
      setSuccess(`${tech.name} research started!`);
      
      // Refresh data
      const researchRes = await fetch(ENDPOINTS.research(address));
      const researchData = await researchRes.json();
      if (researchData.research) {
        const researchLevels = {};
        let currentResearch = null;
        
        researchData.research.forEach(r => {
          researchLevels[r.techType] = r.level || 0;
          if (r.isResearching && r.completesAt) {
            currentResearch = {
              techType: r.techType,
              completesAt: new Date(r.completesAt).getTime(),
            };
          }
        });
        
        setPlayerResearch(researchLevels);
        setActiveResearch(currentResearch);
      }
      
      const resourcesRes = await fetch(ENDPOINTS.resources(address));
      const resourcesData = await resourcesRes.json();
      if (resourcesData.resources) setResources(resourcesData.resources);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setResearching(null);
    }
  };

  const handleCancel = async () => {
    if (!address || !activeResearch) return;
    
    setError(null);
    
    try {
      const response = await fetch(ENDPOINTS.cancelResearch(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerAddress: address,
          techType: activeResearch.techType,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel research');
      }
      
      setSuccess('Research cancelled');
      setActiveResearch(null);
      
      // Refresh data
      const researchRes = await fetch(ENDPOINTS.research(address));
      const researchData = await researchRes.json();
      if (researchData.research) {
        const researchLevels = {};
        researchData.research.forEach(r => {
          researchLevels[r.techType] = r.level || 0;
        });
        setPlayerResearch(researchLevels);
      }
      
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredTech = TECHNOLOGIES.filter(t => t.category === selectedCategory);
  
  const canAfford = (tech) => {
    if (!tech.baseCost) return true;
    return Object.entries(tech.baseCost).every(([resource, amount]) => 
      (resources[resource] || 0) >= amount
    );
  };
  
  const meetsRequirements = (tech) => {
    if (!tech.requires) return true;
    // Check if player has the required facility
    const hasResearchLab = facilities.some(f => f.facilityType === 'research_lab' && f.level > 0);
    if (tech.requires === 'research-nexus' || tech.requires === 'weapons-lab') {
      return hasResearchLab;
    }
    return false;
  };
  
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };
  
  const researchTime = (tech, level) => {
    const baseTime = 120;
    const time = Math.floor(baseTime * Math.pow(1.7, level));
    return formatTime(time);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FlaskConical className="w-16 h-16 mx-auto mb-4 text-slate-500" />
          <h2 className="text-xl font-bold text-slate-300">Connect Wallet</h2>
          <p className="text-slate-500 mt-2">Connect your wallet to access research</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  const hasResearchLab = facilities.some(f => f.facilityType === 'research_lab' && f.level > 0);

  return (
    <div className="min-h-screen p-3 sm:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Research Lab</h1>
        <p className="text-slate-400 text-sm sm:text-base">Unlock technologies to gain strategic advantages</p>
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

      {/* Active Research Banner */}
      {activeResearch && (
        <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 animate-spin flex-shrink-0" />
              <div>
                <p className="text-purple-300 font-medium text-sm sm:text-base">
                  Researching: {TECHNOLOGIES.find(t => t.id === activeResearch.techType)?.name || activeResearch.techType}
                </p>
                <p className="text-purple-400/80 text-xs sm:text-sm">
                  Time remaining: {formatTime(timeRemaining)}
                </p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="flex items-center justify-center gap-1 px-3 py-2 min-h-[44px] rounded text-sm font-medium bg-red-600/30 hover:bg-red-600/50 active:bg-red-600/60 text-red-300 transition self-end sm:self-auto"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Requirement Notice */}
      {!hasResearchLab && (
        <div className="bg-amber-900/30 border border-amber-700/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-start gap-2 sm:gap-3">
            <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-300 font-medium text-sm sm:text-base">Research Facilities Required</p>
              <p className="text-amber-400/80 text-xs sm:text-sm mt-1">
                Build a <strong>Research Lab</strong> in the Facilities tab to unlock technologies.
              </p>
            </div>
          </div>
        </div>
      )}

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
      <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex items-start gap-2 sm:gap-3">
          <Info className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-purple-300 font-medium text-sm sm:text-base">Research Tips</p>
            <p className="text-purple-400/80 text-xs sm:text-sm mt-1">
              Technologies provide permanent bonuses. Only one research can be in progress at a time.
              Higher levels cost more resources and take longer to complete.
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
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 active:bg-slate-600'
            }`}
          >
            {cat.icon}
            {cat.name}
          </button>
        ))}
      </div>

      {/* Technology Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredTech.map(tech => {
          const level = playerResearch[tech.id] || 0;
          const affordable = canAfford(tech);
          const hasReqs = meetsRequirements(tech);
          const isResearchingThis = activeResearch?.techType === tech.id;
          const canResearch = affordable && hasReqs && !activeResearch && level < tech.maxLevel;
          const isStarting = researching === tech.id;
          
          return (
            <div
              key={tech.id}
              className={`bg-slate-800/50 border rounded-lg p-3 sm:p-4 cursor-pointer transition hover:border-purple-600 ${
                selectedTech?.id === tech.id ? 'border-purple-500' : 'border-slate-700'
              } ${!hasReqs ? 'opacity-60' : ''} ${isResearchingThis ? 'border-purple-500 bg-purple-900/20' : ''}`}
              onClick={() => setSelectedTech(tech)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="text-purple-400 scale-75 sm:scale-100">{tech.icon}</div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm sm:text-base">{tech.name}</h3>
                    <span className="text-xs sm:text-sm text-slate-500">Level {level}/{tech.maxLevel}</span>
                  </div>
                </div>
                {!hasReqs && <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />}
                {isResearchingThis && (
                  <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-purple-500/20 text-purple-400 text-xs rounded flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span className="hidden sm:inline">Researching</span>
                  </span>
                )}
              </div>
              
              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-400 mb-2">{tech.description}</p>
              
              {/* Bonus */}
              <p className="text-xs sm:text-sm text-purple-400 mb-2 sm:mb-3">Bonus: {tech.bonus}</p>
              
              {/* Requirements */}
              {!hasReqs && (
                <p className="text-xs text-amber-500 mb-2">Requires: Research Lab</p>
              )}
              
              {/* Cost */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                {Object.entries(tech.baseCost || {}).map(([resource, amount]) => (
                  amount > 0 && (
                    <span
                      key={resource}
                      className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded ${
                        (resources[resource] || 0) >= amount
                          ? 'bg-slate-700 text-slate-300'
                          : 'bg-red-900/30 text-red-400'
                      }`}
                    >
                      {RESOURCE_DISPLAY[resource] || resource}: {amount.toLocaleString()}
                    </span>
                  )
                ))}
              </div>
              
              {/* Research Button */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {isResearchingThis ? formatTime(timeRemaining) : researchTime(tech, level)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResearch(tech);
                  }}
                  disabled={!canResearch || isStarting}
                  className={`flex items-center gap-1 px-3 py-2 min-h-[44px] rounded text-sm font-medium transition ${
                    canResearch && !isStarting
                      ? 'bg-purple-600 hover:bg-purple-500 active:bg-purple-400 text-white'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isStarting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowUp className="w-4 h-4" />
                  )}
                  {level === tech.maxLevel ? 'Maxed' : level === 0 ? 'Research' : 'Upgrade'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
