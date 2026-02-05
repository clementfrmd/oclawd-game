import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Rocket, Building2, FlaskConical, Shield, Zap, Target, AlertTriangle, Clock, Loader2 } from 'lucide-react';
import { useAccount } from 'wagmi';

const API_BASE = 'http://213.246.39.151:24011/api';

export function Dashboard() {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Start with empty state - no mock data
  const [gameState, setGameState] = useState({
    colony: {
      name: 'New Colony',
      coordinates: '0:0:0',
      fields: { used: 0, total: 163 }
    },
    resources: {
      ore: 0,
      crystal: 0,
      plasma: 0,
      energy: 0
    },
    production: {
      ore: 0,
      crystal: 0,
      plasma: 0,
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
    alerts: []
  });

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

        // Fetch dashboard data from API
        const response = await fetch(`${API_BASE}/dashboard?address=${address}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Update state with real data from API
        if (data) {
          setGameState({
            colony: data.colony || {
              name: 'New Colony',
              coordinates: '0:0:0',
              fields: { used: 0, total: 163 }
            },
            resources: data.resources || {
              ore: 0,
              crystal: 0,
              plasma: 0,
              energy: 0
            },
            production: data.production || {
              ore: 0,
              crystal: 0,
              plasma: 0,
              energy: 0
            },
            queue: data.queue || {
              building: null,
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
      } finally {
        setLoading(false);
      }
    }

    fetchGameState();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchGameState, 30000);
    return () => clearInterval(interval);
  }, [isConnected, address]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="stars-bg" />
        <div className="nebula" />
        <div className="relative text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
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
          <Rocket className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
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
      
      <div className="relative max-w-7xl mx-auto px-4 py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded text-red-400">
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            Failed to load data: {error}. Showing cached/default values.
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-white">
                COMMAND CENTER
              </h1>
              <span className="px-2 py-1 bg-green-500/20 border border-green-500/50 rounded text-green-400 text-xs font-mono">
                ONLINE
              </span>
            </div>
            <p className="text-gray-400">
              Colony: <span className="text-cyan-400 font-mono">{gameState.colony.name}</span> • 
              Coordinates: <span className="text-cyan-400 font-mono">{gameState.colony.coordinates}</span>
            </p>
          </div>
          
          <div className="flex gap-2">
            <Link to="/galaxy" className="btn-secondary py-2 px-4 text-sm">
              Galaxy Map
            </Link>
          </div>
        </div>

        {/* Resources Bar */}
        <div className="panel p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Status */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Queues */}
            <div className="panel p-6">
              <h2 className="font-display text-xl text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                ACTIVE CONSTRUCTION
              </h2>
              <div className="space-y-3">
                {gameState.queue.building ? (
                  <QueueItem
                    type="Building"
                    name={gameState.queue.building.name}
                    timeLeft={gameState.queue.building.timeLeft}
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
                    timeLeft={gameState.queue.research.timeLeft}
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
            <div className="panel p-6">
              <h2 className="font-display text-xl text-white mb-4">QUICK ACTIONS</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <ActionCard to="/facilities" icon={Building2} label="Build" color="cyan" />
                <ActionCard to="/research" icon={FlaskConical} label="Research" color="purple" />
                <ActionCard to="/fleet" icon={Rocket} label="Fleet" color="orange" />
                <ActionCard to="/defense" icon={Shield} label="Defense" color="red" />
              </div>
            </div>

            {/* Fleet Overview */}
            <div className="panel p-6">
              <h2 className="font-display text-xl text-white mb-4 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-orange-400" />
                FLEET STATUS
              </h2>
              {gameState.fleet.total > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-gray-400 text-sm mb-1">Total Vessels</div>
                      <div className="font-mono text-3xl text-white">{gameState.fleet.total.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm mb-1">Fleet Power</div>
                      <div className="font-mono text-3xl text-orange-400">{gameState.fleet.power.toLocaleString()}</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Rocket className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No vessels in fleet</p>
                  <Link to="/fleet" className="text-cyan-400 text-sm hover:underline">Build your first ship →</Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Colony Info */}
            <div className="panel panel-purple p-6">
              <h2 className="font-display text-lg text-white mb-4">COLONY INFO</h2>
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
                  <span className="font-mono text-cyan-400">{gameState.colony.coordinates}</span>
                </div>
              </div>
            </div>

            {/* $VOID Balance */}
            <div className="panel corner-brackets p-6">
              <h2 className="font-display text-lg text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                $VOID BALANCE
              </h2>
              <div className="text-center py-4">
                <div className="font-mono text-4xl text-purple-400 text-glow-purple mb-2">
                  {gameState.voidBalance.toLocaleString()}
                </div>
                <div className="text-gray-400 text-sm">Available for boosts</div>
              </div>
              <Link to="/marketplace" className="block w-full btn-secondary text-center text-sm mt-4">
                Buy $VOID
              </Link>
            </div>

            {/* Alerts */}
            <div className="panel panel-orange p-6">
              <h2 className="font-display text-lg text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
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

function ResourceDisplay({ name, value, production, color, icon, isEnergy }) {
  const colors = {
    ore: 'from-amber-600 to-amber-500',
    crystal: 'from-blue-500 to-blue-400',
    plasma: 'from-purple-500 to-purple-400',
    energy: 'from-green-500 to-green-400',
  };

  // Calculate fill based on a reasonable max (for display purposes)
  const maxValues = { ore: 100000, crystal: 50000, plasma: 20000, energy: 500 };
  const fillPercent = Math.min(100, (value / maxValues[color]) * 100);

  return (
    <div className="flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-lg text-white">{value.toLocaleString()}</span>
          <span className={`text-xs ${isEnergy ? (production >= 0 ? 'text-green-400' : 'text-red-400') : 'text-green-400'}`}>
            {isEnergy ? (production >= 0 ? `+${production}` : production) : `+${production}/h`}
          </span>
        </div>
        <div className={`resource-bar mt-1 resource-${color}`}>
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
    cyan: 'border-cyan-500/50 bg-cyan-500/10',
  };

  const iconColors = {
    orange: 'text-orange-400',
    purple: 'text-purple-400',
    cyan: 'text-cyan-400',
  };

  return (
    <div className={`flex items-center gap-4 p-4 border rounded ${colors[color]}`}>
      <Icon className={`w-8 h-8 ${iconColors[color]}`} />
      <div className="flex-1">
        <div className="text-xs text-gray-400 uppercase">{type}</div>
        <div className="text-white font-medium">{name}</div>
      </div>
      <div className="text-right">
        <div className="font-mono text-lg text-cyan-400">{timeLeft}</div>
        <div className="text-xs text-gray-400">remaining</div>
      </div>
    </div>
  );
}

function ActionCard({ to, icon: Icon, label, color }) {
  const colors = {
    cyan: 'hover:border-cyan-500/50 hover:bg-cyan-500/10',
    purple: 'hover:border-purple-500/50 hover:bg-purple-500/10',
    orange: 'hover:border-orange-500/50 hover:bg-orange-500/10',
    red: 'hover:border-red-500/50 hover:bg-red-500/10',
  };

  const iconColors = {
    cyan: 'text-cyan-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400',
    red: 'text-red-400',
  };

  return (
    <Link
      to={to}
      className={`flex flex-col items-center gap-2 p-4 border border-white/10 rounded transition-all ${colors[color]}`}
    >
      <Icon className={`w-8 h-8 ${iconColors[color]}`} />
      <span className="text-sm text-gray-300">{label}</span>
    </Link>
  );
}

function Alert({ message, type }) {
  const colors = {
    warning: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    info: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    danger: 'text-red-400 bg-red-500/10 border-red-500/30',
  };

  return (
    <div className={`p-3 border rounded text-sm ${colors[type] || colors.info}`}>
      {message}
    </div>
  );
}
