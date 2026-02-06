import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Rocket, Building2, FlaskConical, Shield, Zap, Target, AlertTriangle, Clock, Loader2 } from 'lucide-react';
import { useAccount } from 'wagmi';
import { ENDPOINTS, toFrontendResources } from '../config/api';

// Default starter state for new players (or when API is unreachable)
const STARTER_STATE = {
  colony: {
    name: 'New Colony',
    coordinates: '1:' + Math.floor(Math.random() * 500) + ':' + Math.floor(Math.random() * 15),
    fields: { used: 0, total: 163 }
  },
  resources: {
    ore: 500,
    crystal: 300,
    plasma: 100,
    energy: 50
  },
  production: {
    ore: 20,
    crystal: 10,
    plasma: 5,
    energy: 0
  },
  queue: {
    building: null,
    research: null
  },
  fleet: {
    total: 0,
    power: 0
  },
  voidBalance: 0,
  alerts: [
    { type: 'info', message: 'Welcome Commander! Build your first Ore Mine in Facilities to start producing resources.' },
    { type: 'tip', message: '💡 Tip: Visit the Marketplace to buy $VOID tokens for special boosts.' }
  ]
};

export function Dashboard() {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [buildingCountdown, setBuildingCountdown] = useState(null); // Live countdown
  const [researchCountdown, setResearchCountdown] = useState(null); // Live countdown
  
  // Start with starter resources
  const [gameState, setGameState] = useState(STARTER_STATE);

  // Fetch real data from backend API
  useEffect(() => {
    async function fetchGameState() {
      if (!isConnected || !address) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch resources from API
        const response = await fetch(ENDPOINTS.resources(address));
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Also fetch facilities to check for active construction
        let buildingQueue = null;
        try {
          const facRes = await fetch(ENDPOINTS.facilities(address));
          const facData = await facRes.json();
          if (facData.facilities) {
            const upgrading = facData.facilities.find(f => f.isUpgrading);
            if (upgrading) {
              const completesAt = new Date(upgrading.upgradeCompletesAt);
              const now = new Date();
              const timeLeftSec = Math.max(0, Math.floor((completesAt - now) / 1000));
              buildingQueue = {
                name: upgrading.facilityType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                level: (upgrading.level || 0) + 1,
                timeLeft: timeLeftSec > 3600 ? `${Math.floor(timeLeftSec/3600)}h ${Math.floor((timeLeftSec%3600)/60)}m` : `${Math.floor(timeLeftSec/60)}m ${timeLeftSec%60}s`
              };
            }
          }
        } catch (e) { console.log('Could not fetch facilities:', e); }
        
        // Update state with real data from API
        if (data) {
          const resources = toFrontendResources(data.resources || {});
          const production = {
            ore: data.productionRates?.metal || 0,
            crystal: data.productionRates?.crystal || 0,
            plasma: data.productionRates?.deuterium || 0,
            energy: data.productionRates?.energyProduction || 0,
          };
          
          setGameState({
            colony: {
              name: 'Colony Alpha',
              coordinates: '1:' + Math.floor(Math.random()*500) + ':' + Math.floor(Math.random()*15),
              fields: { used: 0, total: 163 }
            },
            resources: resources,
            production: production,
            queue: {
              building: buildingQueue,
              research: null
            },
            fleet: data.fleet || {
              total: 0,
              power: 0
            },
            voidBalance: data.voidBalance || 0,
            alerts: data.alerts || []
          });
        }
      } catch (err) {
        console.error('Failed to fetch game state:', err);
        setError(err.message);
        setIsOffline(true);
        // Use starter state when offline
        setGameState(STARTER_STATE);
      } finally {
        setLoading(false);
      }
    }

    fetchGameState();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchGameState, 30000);
    return () => clearInterval(interval);
  }, [isConnected, address]);

  // Real-time countdown timer for building/research queues
  useEffect(() => {
    const timer = setInterval(() => {
      // Update building countdown
      if (gameState.queue?.building?.completesAt) {
        const remaining = Math.max(0, Math.floor((new Date(gameState.queue.building.completesAt).getTime() - Date.now()) / 1000));
        const timeStr = remaining > 3600 
          ? `${Math.floor(remaining/3600)}h ${Math.floor((remaining%3600)/60)}m`
          : `${Math.floor(remaining/60)}m ${remaining%60}s`;
        setBuildingCountdown(timeStr);
      } else if (gameState.queue?.building?.timeLeft) {
        // Fallback: decrement the existing time string
        setBuildingCountdown(prev => {
          if (!prev) return gameState.queue.building.timeLeft;
          // Parse and decrement
          const match = prev.match(/(?:(\d+)h\s*)?(?:(\d+)m\s*)?(?:(\d+)s)?/);
          if (!match) return prev;
          let hours = parseInt(match[1] || 0);
          let mins = parseInt(match[2] || 0);
          let secs = parseInt(match[3] || 0);
          let total = hours * 3600 + mins * 60 + secs - 1;
          if (total <= 0) return '0s';
          hours = Math.floor(total / 3600);
          mins = Math.floor((total % 3600) / 60);
          secs = total % 60;
          if (hours > 0) return `${hours}h ${mins}m`;
          if (mins > 0) return `${mins}m ${secs}s`;
          return `${secs}s`;
        });
      } else {
        setBuildingCountdown(null);
      }

      // Update research countdown (if we have research queue data)
      if (gameState.queue?.research?.completesAt) {
        const remaining = Math.max(0, Math.floor((new Date(gameState.queue.research.completesAt).getTime() - Date.now()) / 1000));
        const timeStr = remaining > 3600 
          ? `${Math.floor(remaining/3600)}h ${Math.floor((remaining%3600)/60)}m`
          : `${Math.floor(remaining/60)}m ${remaining%60}s`;
        setResearchCountdown(timeStr);
      } else {
        setResearchCountdown(null);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.queue]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="stars-bg" />
        <div className="nebula" />
        <div className="relative text-center">
          <Loader2 className="w-12 h-12 text-sky-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading command center...</p>
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
          <Rocket className="w-16 h-16 text-sky-400 mx-auto mb-4" />
          <h2 className="font-display text-2xl text-white mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-4">Connect your wallet to access the Command Center</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="stars-bg" />
      <div className="nebula" />
      
      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Offline/Demo Mode Banner */}
        {isOffline && (
          <div className="mb-4 p-4 bg-amber-500/20 border border-amber-500/50 rounded">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-300 font-medium">Demo Mode Active</p>
                <p className="text-amber-400/80 text-sm mt-1">
                  Running in demo mode with starter resources. Backend API connection pending HTTPS setup.
                  All features are available - your progress will sync once connected.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 mb-4 sm:mb-8">
          <div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <h1 className="font-display text-xl sm:text-3xl md:text-4xl font-bold text-white">
                COMMAND CENTER
              </h1>
              <span className={`px-2 py-1 rounded text-xs font-mono ${
                isOffline 
                  ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400'
                  : 'bg-green-500/20 border border-green-500/50 text-green-400'
              }`}>
                {isOffline ? 'DEMO' : 'ONLINE'}
              </span>
            </div>
            <p className="text-gray-400 text-sm sm:text-base">
              Colony: <span className="text-sky-400 font-mono">{gameState.colony.name}</span> • 
              Coordinates: <span className="text-sky-400 font-mono">{gameState.colony.coordinates}</span>
            </p>
          </div>
          
          <div className="flex gap-2">
            <Link to="/galaxy" className="btn-secondary py-2 px-4 text-sm min-h-[44px] flex items-center">
              Galaxy Map
            </Link>
          </div>
        </div>

        {/* Resources Bar */}
        <div className="panel p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <ResourceDisplay
              name="Ore"
              value={gameState.resources.ore}
              production={gameState.production.ore}
              color="ore"
              iconSrc="/assets/resources/ore.svg"
            />
            <ResourceDisplay
              name="Crystal"
              value={gameState.resources.crystal}
              production={gameState.production.crystal}
              color="crystal"
              iconSrc="/assets/resources/crystal.svg"
            />
            <ResourceDisplay
              name="Plasma"
              value={gameState.resources.plasma}
              production={gameState.production.plasma}
              color="plasma"
              iconSrc="/assets/resources/plasma.svg"
            />
            <ResourceDisplay
              name="Energy"
              value={gameState.resources.energy}
              production={gameState.production.energy}
              color="energy"
              iconSrc="/assets/resources/energy.svg"
              isEnergy
            />
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Status */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Active Queues */}
            <div className="panel p-4 sm:p-6">
              <h2 className="font-display text-base sm:text-xl text-white mb-3 sm:mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400" />
                ACTIVE CONSTRUCTION
              </h2>
              <div className="space-y-3">
                {gameState.queue.building ? (
                  <QueueItem
                    type="Building"
                    name={gameState.queue.building.name}
                    timeLeft={buildingCountdown || gameState.queue.building.timeLeft}
                    icon={Building2}
                    color="orange"
                  />
                ) : (
                  <div className="p-4 border border-white/10 rounded text-gray-500 text-center">
                    No building in queue
                  </div>
                )}
                {gameState.queue.research ? (
                  <QueueItem
                    type="Research"
                    name={gameState.queue.research.name}
                    timeLeft={researchCountdown || gameState.queue.research.timeLeft}
                    icon={FlaskConical}
                    color="purple"
                  />
                ) : (
                  <div className="p-4 border border-white/10 rounded text-gray-500 text-center">
                    No research in queue
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="panel p-4 sm:p-6">
              <h2 className="font-display text-base sm:text-xl text-white mb-3 sm:mb-4">QUICK ACTIONS</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <ActionCard to="/facilities" icon={Building2} label="Build" color="cyan" />
                <ActionCard to="/research" icon={FlaskConical} label="Research" color="purple" />
                <ActionCard to="/fleet" icon={Rocket} label="Fleet" color="orange" />
                <ActionCard to="/defense" icon={Shield} label="Defense" color="red" />
              </div>
            </div>

            {/* Fleet Overview */}
            <div className="panel p-4 sm:p-6">
              <h2 className="font-display text-base sm:text-xl text-white mb-3 sm:mb-4 flex items-center gap-2">
                <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                FLEET STATUS
              </h2>
              {gameState.fleet.total > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <div className="text-gray-400 text-xs sm:text-sm mb-1">Total Vessels</div>
                      <div className="font-mono text-xl sm:text-3xl text-white">{gameState.fleet.total.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs sm:text-sm mb-1">Fleet Power</div>
                      <div className="font-mono text-xl sm:text-3xl text-orange-400">{gameState.fleet.power.toLocaleString()}</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <Rocket className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm sm:text-base">No vessels in fleet</p>
                  <Link to="/fleet" className="text-sky-400 text-sm hover:underline min-h-[44px] inline-flex items-center">Build your first ship →</Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Colony Info */}
            <div className="panel panel-purple p-4 sm:p-6">
              <h2 className="font-display text-base sm:text-lg text-white mb-3 sm:mb-4">COLONY INFO</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Fields Used</span>
                  <span className="font-mono text-white">
                    {gameState.colony.fields.used} / {gameState.colony.fields.total}
                  </span>
                </div>
                <div className="resource-bar">
                  <div 
                    className="resource-bar-fill bg-gradient-to-r from-purple-500 to-purple-400"
                    style={{ width: `${(gameState.colony.fields.used / gameState.colony.fields.total) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-gray-400">Coordinates</span>
                  <span className="font-mono text-sky-400">{gameState.colony.coordinates}</span>
                </div>
              </div>
            </div>

            {/* $VOID Balance */}
            <div className="panel corner-brackets p-4 sm:p-6">
              <h2 className="font-display text-base sm:text-lg text-white mb-3 sm:mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                $VOID BALANCE
              </h2>
              <div className="text-center py-3 sm:py-4">
                <div className="font-mono text-2xl sm:text-4xl text-purple-400 text-highlight-tertiary mb-2">
                  {gameState.voidBalance.toLocaleString()}
                </div>
                <div className="text-gray-400 text-xs sm:text-sm">Available for boosts</div>
              </div>
              <Link to="/marketplace" className="block w-full btn-secondary text-center text-sm mt-3 sm:mt-4 min-h-[44px] flex items-center justify-center">
                Buy $VOID
              </Link>
            </div>

            {/* Alerts */}
            <div className="panel panel-orange p-4 sm:p-6">
              <h2 className="font-display text-base sm:text-lg text-white mb-3 sm:mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                ALERTS
              </h2>
              <div className="space-y-2">
                {gameState.alerts.length > 0 ? (
                  gameState.alerts.map((alert, i) => (
                    <Alert key={i} message={alert.message} type={alert.type} />
                  ))
                ) : (
                  <div className="text-gray-500 text-center py-4">
                    No alerts
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResourceDisplay({ name, value, production, color, iconSrc, isEnergy }) {
  const colors = {
    ore: 'from-amber-700 to-amber-600',
    crystal: 'from-sky-700 to-sky-600',
    plasma: 'from-violet-700 to-violet-600',
    energy: 'from-emerald-700 to-emerald-600',
  };

  // Calculate fill based on a reasonable max (for display purposes)
  const maxValues = { ore: 100000, crystal: 50000, plasma: 20000, energy: 500 };
  const fillPercent = Math.min(100, (value / maxValues[color]) * 100);

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
        <img src={iconSrc} alt={name} className="w-full h-full object-contain" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
          <span className="font-mono text-sm sm:text-lg text-white">{value.toLocaleString()}</span>
          <span className={`text-xs ${isEnergy ? (production >= 0 ? 'text-emerald-500' : 'text-red-500') : 'text-emerald-500'}`}>
            {isEnergy ? (production >= 0 ? `+${production}` : production) : `+${production}/h`}
          </span>
        </div>
        <div className={`resource-bar mt-1 resource-${color} h-1 sm:h-1.5`}>
          <div className={`resource-bar-fill bg-gradient-to-r ${colors[color]}`} style={{ width: `${fillPercent}%` }} />
        </div>
      </div>
    </div>
  );
}

function QueueItem({ type, name, timeLeft, icon: Icon, color }) {
  const colors = {
    orange: 'border-orange-500/50 bg-orange-500/10',
    purple: 'border-purple-500/50 bg-purple-500/10',
    cyan: 'border-sky-600/50 bg-sky-600/10',
  };

  const iconColors = {
    orange: 'text-orange-400',
    purple: 'text-purple-400',
    cyan: 'text-sky-400',
  };

  return (
    <div className={`flex items-center gap-4 p-4 border rounded ${colors[color]}`}>
      <Icon className={`w-8 h-8 ${iconColors[color]}`} />
      <div className="flex-1">
        <div className="text-xs text-gray-400 uppercase">{type}</div>
        <div className="text-white font-medium">{name}</div>
      </div>
      <div className="text-right">
        <div className="font-mono text-lg text-sky-400">{timeLeft}</div>
        <div className="text-xs text-gray-400">remaining</div>
      </div>
    </div>
  );
}

function ActionCard({ to, icon: Icon, label, color }) {
  const colors = {
    cyan: 'hover:border-sky-600/50 hover:bg-sky-600/10 active:bg-sky-600/20',
    purple: 'hover:border-purple-500/50 hover:bg-purple-500/10 active:bg-purple-500/20',
    orange: 'hover:border-orange-500/50 hover:bg-orange-500/10 active:bg-orange-500/20',
    red: 'hover:border-red-500/50 hover:bg-red-500/10 active:bg-red-500/20',
  };

  const iconColors = {
    cyan: 'text-sky-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400',
    red: 'text-red-400',
  };

  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center gap-1 sm:gap-2 p-3 sm:p-4 min-h-[80px] sm:min-h-[96px] border border-white/10 rounded transition-all ${colors[color]}`}
    >
      <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${iconColors[color]}`} />
      <span className="text-xs sm:text-sm text-gray-300">{label}</span>
    </Link>
  );
}

function Alert({ message, type }) {
  const colors = {
    warning: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    info: 'text-sky-400 bg-sky-600/10 border-sky-600/30',
    danger: 'text-red-400 bg-red-500/10 border-red-500/30',
  };

  return (
    <div className={`p-3 border rounded text-sm ${colors[type] || colors.info}`}>
      {message}
    </div>
  );
}
