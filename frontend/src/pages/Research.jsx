import React, { useState } from 'react';
import { FlaskConical, Zap, Clock, ArrowUp, Lock, Info, Crosshair, Shield, Rocket } from 'lucide-react';
import { useAccount } from 'wagmi';

// Technology definitions from game design
const TECHNOLOGIES = [
  // Combat
  { id: 'weapons-systems', name: 'Weapons Systems', category: 'combat', description: 'Increases all weapon damage by 10% per level', baseCost: { ore: 800, crystal: 200 }, bonus: '+10% damage', maxLevel: 20, icon: <Crosshair className="w-6 h-6" />, requires: 'weapons-lab' },
  { id: 'armor-plating', name: 'Armor Plating', category: 'combat', description: 'Increases hull strength by 10% per level', baseCost: { ore: 1000, crystal: 300 }, bonus: '+10% hull', maxLevel: 20, icon: <Shield className="w-6 h-6" />, requires: 'weapons-lab' },
  { id: 'shield-technology', name: 'Shield Technology', category: 'combat', description: 'Increases shield capacity by 10% per level', baseCost: { ore: 200, crystal: 600 }, bonus: '+10% shields', maxLevel: 20, icon: <Shield className="w-6 h-6" />, requires: 'weapons-lab' },
  { id: 'targeting-systems', name: 'Targeting Systems', category: 'combat', description: 'Increases critical hit chance', baseCost: { ore: 400, crystal: 800, plasma: 200 }, bonus: '+5% crit', maxLevel: 15, icon: <Crosshair className="w-6 h-6" />, requires: 'weapons-lab' },
  
  // Propulsion
  { id: 'combustion-drive', name: 'Combustion Drive', category: 'propulsion', description: 'Basic propulsion for light vessels', baseCost: { ore: 400, crystal: 600 }, bonus: 'Base speed', maxLevel: 10, icon: <Rocket className="w-6 h-6" />, requires: 'research-nexus' },
  { id: 'impulse-drive', name: 'Impulse Drive', category: 'propulsion', description: 'Advanced propulsion for medium vessels', baseCost: { ore: 2000, crystal: 4000, plasma: 600 }, bonus: '2x speed', maxLevel: 15, icon: <Rocket className="w-6 h-6" />, requires: 'research-nexus' },
  { id: 'hyperspace-drive', name: 'Hyperspace Drive', category: 'propulsion', description: 'FTL travel for capital ships', baseCost: { ore: 10000, crystal: 20000, plasma: 6000 }, bonus: '10x speed', maxLevel: 12, icon: <Rocket className="w-6 h-6" />, requires: 'research-nexus' },
  
  // Economy
  { id: 'mining-efficiency', name: 'Mining Efficiency', category: 'economy', description: 'Increases ore production by 5% per level', baseCost: { ore: 200, crystal: 100 }, bonus: '+5% ore', maxLevel: 25, icon: <FlaskConical className="w-6 h-6" />, requires: 'research-nexus' },
  { id: 'crystal-synthesis', name: 'Crystal Synthesis', category: 'economy', description: 'Increases crystal production by 5% per level', baseCost: { ore: 200, crystal: 300 }, bonus: '+5% crystal', maxLevel: 25, icon: <FlaskConical className="w-6 h-6" />, requires: 'research-nexus' },
  { id: 'plasma-refining', name: 'Plasma Refining', category: 'economy', description: 'Increases plasma production by 5% per level', baseCost: { ore: 400, crystal: 400, plasma: 200 }, bonus: '+5% plasma', maxLevel: 20, icon: <FlaskConical className="w-6 h-6" />, requires: 'research-nexus' },
  { id: 'energy-optimization', name: 'Energy Optimization', category: 'economy', description: 'Reduces energy consumption by 3% per level', baseCost: { ore: 500, crystal: 500 }, bonus: '-3% energy', maxLevel: 20, icon: <Zap className="w-6 h-6" />, requires: 'research-nexus' },
  
  // Special
  { id: 'espionage', name: 'Espionage Technology', category: 'special', description: 'Improves spy probe capabilities', baseCost: { ore: 200, crystal: 1000 }, bonus: '+intel', maxLevel: 15, icon: <FlaskConical className="w-6 h-6" />, requires: 'research-nexus' },
  { id: 'graviton', name: 'Graviton Technology', category: 'special', description: 'Required for Titan-class vessels', baseCost: { ore: 0, crystal: 0, plasma: 0 }, bonus: 'Unlocks Titans', maxLevel: 1, special: 'Requires massive energy', icon: <FlaskConical className="w-6 h-6" />, requires: 'research-nexus' },
  { id: 'void-harmonics', name: 'Void Harmonics', category: 'special', description: 'Harness the power of the void', baseCost: { ore: 50000, crystal: 50000, plasma: 25000 }, bonus: '$VOID boost', maxLevel: 10, icon: <FlaskConical className="w-6 h-6" />, requires: 'research-nexus' },
];

const CATEGORIES = [
  { id: 'combat', name: 'Combat', icon: <Crosshair className="w-4 h-4" /> },
  { id: 'propulsion', name: 'Propulsion', icon: <Rocket className="w-4 h-4" /> },
  { id: 'economy', name: 'Economy', icon: <FlaskConical className="w-4 h-4" /> },
  { id: 'special', name: 'Special', icon: <FlaskConical className="w-4 h-4" /> },
];

export function Research() {
  const { isConnected } = useAccount();
  const [selectedCategory, setSelectedCategory] = useState('combat');
  const [selectedTech, setSelectedTech] = useState(null);
  
  // Mock player research levels
  const [playerResearch] = useState({
    'weapons-systems': 0,
    'armor-plating': 0,
  });
  
  // Mock resources
  const [resources] = useState({ ore: 500, crystal: 300, plasma: 100 });
  
  // Mock facilities (for requirements check)
  const [facilities] = useState({
    'weapons-lab': 0,
    'research-nexus': 0,
  });
  
  const filteredTech = TECHNOLOGIES.filter(t => t.category === selectedCategory);
  
  const canAfford = (tech) => {
    if (!tech.baseCost) return true;
    return Object.entries(tech.baseCost).every(([resource, amount]) => 
      resources[resource] >= amount
    );
  };
  
  const meetsRequirements = (tech) => {
    if (!tech.requires) return true;
    return (facilities[tech.requires] || 0) > 0;
  };
  
  const researchTime = (tech, level) => {
    const baseTime = 120;
    const time = Math.floor(baseTime * Math.pow(1.7, level));
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
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

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Research Lab</h1>
        <p className="text-slate-400">Unlock technologies to gain strategic advantages</p>
      </div>
      
      {/* Requirement Notice */}
      {facilities['research-nexus'] === 0 && facilities['weapons-lab'] === 0 && (
        <div className="bg-amber-900/30 border border-amber-700/50 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-300 font-medium">Research Facilities Required</p>
              <p className="text-amber-400/80 text-sm mt-1">
                Build a <strong>Research Nexus</strong> or <strong>Weapons Research Lab</strong> in the Facilities tab to unlock technologies.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Info Box */}
      <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-purple-300 font-medium">Research Tips</p>
            <p className="text-purple-400/80 text-sm mt-1">
              Technologies provide permanent bonuses. Combat tech requires a Weapons Lab; economy and propulsion tech require a Research Nexus.
              Only one research can be in progress at a time.
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
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {cat.icon}
            {cat.name}
          </button>
        ))}
      </div>

      {/* Technology Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTech.map(tech => {
          const level = playerResearch[tech.id] || 0;
          const affordable = canAfford(tech);
          const hasReqs = meetsRequirements(tech);
          const canResearch = affordable && hasReqs;
          
          return (
            <div
              key={tech.id}
              className={`bg-slate-800/50 border rounded-lg p-4 cursor-pointer transition hover:border-purple-600 ${
                selectedTech?.id === tech.id ? 'border-purple-500' : 'border-slate-700'
              } ${!hasReqs ? 'opacity-60' : ''}`}
              onClick={() => setSelectedTech(tech)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-purple-400">{tech.icon}</div>
                  <div>
                    <h3 className="font-bold text-slate-100">{tech.name}</h3>
                    <span className="text-sm text-slate-500">Level {level}/{tech.maxLevel}</span>
                  </div>
                </div>
                {!hasReqs && <Lock className="w-5 h-5 text-slate-600" />}
              </div>
              
              {/* Description */}
              <p className="text-sm text-slate-400 mb-2">{tech.description}</p>
              
              {/* Bonus */}
              <p className="text-sm text-purple-400 mb-3">Bonus: {tech.bonus}</p>
              
              {/* Requirements */}
              {!hasReqs && (
                <p className="text-xs text-amber-500 mb-2">Requires: {tech.requires}</p>
              )}
              
              {/* Cost */}
              <div className="flex flex-wrap gap-2 mb-3">
                {Object.entries(tech.baseCost || {}).map(([resource, amount]) => (
                  amount > 0 && (
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
                  )
                ))}
              </div>
              
              {/* Research Button */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {researchTime(tech, level)}
                </span>
                <button
                  disabled={!canResearch}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition ${
                    canResearch
                      ? 'bg-purple-600 hover:bg-purple-500 text-white'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <ArrowUp className="w-4 h-4" />
                  {level === 0 ? 'Research' : 'Upgrade'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
