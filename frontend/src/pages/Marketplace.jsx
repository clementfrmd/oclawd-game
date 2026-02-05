import React, { useState } from 'react';
import { ShoppingCart, TrendingUp, ArrowUpDown, Zap, Shield, Clock, Rocket } from 'lucide-react';

export function Marketplace() {
  const [activeTab, setActiveTab] = useState('resources');

  return (
    <div className="min-h-screen relative">
      <div className="stars-bg" />
      <div className="nebula" />
      
      <div className="relative max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-green-400" />
              MARKETPLACE
            </h1>
            <p className="text-gray-400 mt-1">
              Trade resources and purchase $VOID boosts
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['resources', 'boosts', 'vessels'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded font-medium capitalize transition-all ${
                activeTab === tab
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'resources' && <ResourceMarket />}
        {activeTab === 'boosts' && <BoostMarket />}
        {activeTab === 'vessels' && <VesselMarket />}
      </div>
    </div>
  );
}

function ResourceMarket() {
  const resources = [
    { name: 'Ore', icon: '⛏️', price: 0.05, change: 2.3, volume: '1.2M' },
    { name: 'Crystal', icon: '💎', price: 0.12, change: -1.5, volume: '890K' },
    { name: 'Plasma', icon: '🔮', price: 0.35, change: 5.7, volume: '450K' },
  ];

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Price Tickers */}
      <div className="panel p-6">
        <h2 className="font-display text-xl text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          RESOURCE PRICES
        </h2>
        <div className="space-y-4">
          {resources.map((res) => (
            <div key={res.name} className="flex items-center justify-between p-4 bg-black/30 rounded border border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{res.icon}</span>
                <div>
                  <div className="text-white font-medium">{res.name}</div>
                  <div className="text-gray-400 text-sm">Vol: {res.volume}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-xl text-white">{res.price} ETH</div>
                <div className={`text-sm ${res.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {res.change >= 0 ? '+' : ''}{res.change}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trade Panel */}
      <div className="panel p-6">
        <h2 className="font-display text-xl text-white mb-4 flex items-center gap-2">
          <ArrowUpDown className="w-5 h-5 text-cyan-400" />
          TRADE
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm">Sell</label>
            <div className="flex gap-2 mt-2">
              <select className="flex-1 bg-black/30 border border-white/10 rounded px-4 py-3 text-white">
                <option>⛏️ Ore</option>
                <option>💎 Crystal</option>
                <option>🔮 Plasma</option>
              </select>
              <input
                type="number"
                placeholder="Amount"
                className="flex-1 bg-black/30 border border-white/10 rounded px-4 py-3 text-white"
              />
            </div>
          </div>
          
          <div className="flex justify-center">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center">
              <ArrowUpDown className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          
          <div>
            <label className="text-gray-400 text-sm">Receive</label>
            <div className="flex gap-2 mt-2">
              <select className="flex-1 bg-black/30 border border-white/10 rounded px-4 py-3 text-white">
                <option>💎 Crystal</option>
                <option>⛏️ Ore</option>
                <option>🔮 Plasma</option>
              </select>
              <input
                type="number"
                placeholder="Amount"
                className="flex-1 bg-black/30 border border-white/10 rounded px-4 py-3 text-white"
                disabled
              />
            </div>
          </div>
          
          <button className="btn-primary w-full mt-4">
            Execute Trade
          </button>
        </div>
      </div>
    </div>
  );
}

function BoostMarket() {
  const boosts = [
    { id: 'shield', name: 'Void Shield', description: '48h attack immunity', cost: 1000, icon: Shield, color: 'cyan' },
    { id: 'accelerator', name: 'Accelerator 50%', description: '50% faster construction for 24h', cost: 250, icon: Zap, color: 'orange' },
    { id: 'yield', name: 'Yield Amplifier', description: '+50% resource production for 24h', cost: 200, icon: TrendingUp, color: 'green' },
    { id: 'instant', name: 'Instant Build', description: 'Complete current construction NOW', cost: 500, icon: Clock, color: 'purple' },
    { id: 'colony', name: 'Colony Permit', description: '+1 permanent colony slot', cost: 2000, icon: Rocket, color: 'gold' },
  ];

  const colorClasses = {
    cyan: 'border-cyan-500/30 hover:border-cyan-500/50',
    orange: 'border-orange-500/30 hover:border-orange-500/50',
    green: 'border-green-500/30 hover:border-green-500/50',
    purple: 'border-purple-500/30 hover:border-purple-500/50',
    gold: 'border-yellow-500/30 hover:border-yellow-500/50',
  };

  const iconColorClasses = {
    cyan: 'text-cyan-400',
    orange: 'text-orange-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    gold: 'text-yellow-400',
  };

  return (
    <div>
      {/* Balance Header */}
      <div className="panel p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="font-display text-xl text-white mb-1">Your $VOID Balance</h2>
            <p className="text-gray-400 text-sm">Spend $VOID for powerful in-game boosts</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-mono text-3xl text-purple-400 text-glow-purple">2,450</div>
              <div className="text-gray-400 text-sm">$VOID available</div>
            </div>
            <button className="btn-secondary py-2 px-4">
              Buy $VOID
            </button>
          </div>
        </div>
      </div>

      {/* Boost Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {boosts.map((boost) => {
          const Icon = boost.icon;
          return (
            <div key={boost.id} className={`panel ${colorClasses[boost.color]} p-6 transition-all`}>
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${iconColorClasses[boost.color]}`} />
                </div>
                <div>
                  <h3 className="font-display text-lg text-white">{boost.name}</h3>
                  <p className="text-gray-400 text-sm">{boost.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xl text-purple-400">{boost.cost.toLocaleString()}</span>
                  <span className="text-gray-400 text-sm ml-1">$VOID</span>
                </div>
                <button className="btn-primary py-2 px-4 text-sm">
                  Activate
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VesselMarket() {
  const listings = [
    { seller: 'Commander_X', vessel: 'Strike Cruiser', quantity: 5, price: 0.05 },
    { seller: 'AI_Agent_7', vessel: 'Scout Fighter', quantity: 50, price: 0.008 },
    { seller: 'WarLord99', vessel: 'Dreadnought', quantity: 2, price: 0.15 },
    { seller: 'Zerg_Rush', vessel: 'Assault Fighter', quantity: 20, price: 0.02 },
  ];

  return (
    <div className="panel overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 p-4 bg-black/30 border-b border-white/10 text-sm text-gray-400 uppercase">
        <div className="col-span-3">Seller</div>
        <div className="col-span-3">Vessel</div>
        <div className="col-span-2">Quantity</div>
        <div className="col-span-2">Price/Unit</div>
        <div className="col-span-2">Action</div>
      </div>

      {/* Listings */}
      <div className="divide-y divide-white/5">
        {listings.map((listing, i) => (
          <div key={i} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors">
            <div className="col-span-3">
              <span className="text-cyan-400">{listing.seller}</span>
            </div>
            <div className="col-span-3 text-white">{listing.vessel}</div>
            <div className="col-span-2 font-mono text-white">{listing.quantity}</div>
            <div className="col-span-2 font-mono text-green-400">{listing.price} ETH</div>
            <div className="col-span-2">
              <button className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/50 rounded hover:bg-green-500/30 text-sm">
                Buy
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Sell Your Vessels */}
      <div className="p-4 border-t border-white/10 bg-black/20">
        <button className="btn-secondary w-full">
          List Your Vessels for Sale
        </button>
      </div>
    </div>
  );
}
