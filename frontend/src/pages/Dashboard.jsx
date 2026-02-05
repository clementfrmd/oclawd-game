import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Rocket, Building2, FlaskConical, Shield, Zap, Target, AlertTriangle, Clock } from 'lucide-react';
import { useAccount } from 'wagmi';

export function Dashboard() {
  const { address, isConnected } = useAccount();
  const [gameState, setGameState] = useState({
    colony: {
      name: 'Alpha Prime',
      coordinates: '1:45:7',
      fields: { used: 12, total: 163 }
    },
    resources: {
      ore: 15420,
      crystal: 8750,
      plasma: 2340,
      energy: 156
    },
    production: {
      ore: 1250,
      crystal: 680,
      plasma: 220,
      energy: 45
    },
    queue: {
      building: { name: 'Ore Extractor Lv.8', timeLeft: '2h 45m' },
      research: { name: 'Weapons Systems Lv.5', timeLeft: '4h 12m' }
    },
    fleet: {
      total: 127,
      power: 45600
    }
  });

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="stars-bg" />
      <div className="nebula" />
      
      <div className="relative max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-white">
                COMMAND CENTER
              </h1>
              {isConnected && (
                <span className="px-2 py-1 bg-green-500/20 border border-green-500/50 rounded text-green-400 text-xs font-mono">
                  ONLINE
                </span>
              )}
            </div>
            <p className="text-gray-400">
              Colony: <span className="text-accent font-mono">{gameState.colony.name}</span> • 
              Coordinates: <span className="text-accent font-mono">{gameState.colony.coordinates}</span>
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
              icon="⛏️"
            />
            <ResourceDisplay
              name="Crystal"
              value={gameState.resources.crystal}
              production={gameState.production.crystal}
              color="crystal"
              icon="💎"
            />
            <ResourceDisplay
              name="Plasma"
              value={gameState.resources.plasma}
              production={gameState.production.plasma}
              color="plasma"
              icon="🔮"
            />
            <ResourceDisplay
              name="Energy"
              value={gameState.resources.energy}
              production={gameState.production.energy}
              color="energy"
              icon="⚡"
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
                <Clock className="w-5 h-5 text-accent" />
                ACTIVE CONSTRUCTION
              </h2>
              <div className="space-y-3">
                {gameState.queue.building && (
                  <QueueItem
                    type="Building"
                    name={gameState.queue.building.name}
                    timeLeft={gameState.queue.building.timeLeft}
                    icon={Building2}
                    color="orange"
                  />
                )}
                {gameState.queue.research && (
                  <QueueItem
                    type="Research"
                    name={gameState.queue.research.name}
                    timeLeft={gameState.queue.research.timeLeft}
                    icon={FlaskConical}
                    color="purple"
                  />
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
              <div className="mt-4 grid grid-cols-3 gap-2">
                <VesselCount name="Scout Fighters" count={45} />
                <VesselCount name="Strike Cruisers" count={32} />
                <VesselCount name="Dreadnoughts" count={12} />
              </div>
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
                  <span className="font-mono text-accent">{gameState.colony.coordinates}</span>
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
                <div className="font-mono text-4xl text-purple-400 text-accent-tertiary mb-2">
                  {isConnected ? '2,450' : '---'}
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
                <Alert message="Crystal storage 85% full" type="warning" />
                <Alert message="Research complete in 4h" type="info" />
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
          <div className={`resource-bar-fill bg-gradient-to-r ${colors[color]}`} style={{ width: '65%' }} />
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
    cyan: 'text-accent',
  };

  return (
    <div className={`flex items-center gap-4 p-4 border rounded ${colors[color]}`}>
      <Icon className={`w-8 h-8 ${iconColors[color]}`} />
      <div className="flex-1">
        <div className="text-xs text-gray-400 uppercase">{type}</div>
        <div className="text-white font-medium">{name}</div>
      </div>
      <div className="text-right">
        <div className="font-mono text-lg text-accent">{timeLeft}</div>
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
    cyan: 'text-accent',
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

function VesselCount({ name, count }) {
  return (
    <div className="p-2 bg-white/5 rounded text-center">
      <div className="font-mono text-lg text-white">{count}</div>
      <div className="text-xs text-gray-400">{name}</div>
    </div>
  );
}

function Alert({ message, type }) {
  const colors = {
    warning: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    info: 'text-accent bg-cyan-500/10 border-cyan-500/30',
    danger: 'text-red-400 bg-red-500/10 border-red-500/30',
  };

  return (
    <div className={`p-3 border rounded text-sm ${colors[type]}`}>
      {message}
    </div>
  );
}
