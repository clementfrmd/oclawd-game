import React, { useState, useEffect } from 'react';
import { ShoppingCart, Tag, Wallet, RefreshCw, ExternalLink } from 'lucide-react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

// Mock NFT ship data - in production this would come from your smart contract
const mockShips = [
  { id: 1, name: 'Stellar Cruiser', type: 'explorer', rarity: 'rare', price: '0.05', image: '🚀', stats: { speed: 85, cargo: 120, armor: 60 } },
  { id: 2, name: 'Void Runner', type: 'fighter', rarity: 'epic', price: '0.12', image: '🛸', stats: { speed: 95, cargo: 40, armor: 80 } },
  { id: 3, name: 'Cargo Hauler X', type: 'transport', rarity: 'common', price: '0.02', image: '📦', stats: { speed: 45, cargo: 300, armor: 50 } },
  { id: 4, name: 'Mining Drone MK3', type: 'mining', rarity: 'uncommon', price: '0.03', image: '⛏️', stats: { speed: 30, cargo: 200, armor: 40 } },
  { id: 5, name: 'Phantom Strike', type: 'fighter', rarity: 'legendary', price: '0.35', image: '⚔️', stats: { speed: 99, cargo: 20, armor: 95 } },
  { id: 6, name: 'Deep Space Explorer', type: 'explorer', rarity: 'rare', price: '0.08', image: '🔭', stats: { speed: 75, cargo: 150, armor: 55 } },
];

const rarityColors = {
  common: 'from-gray-400 to-gray-500',
  uncommon: 'from-green-400 to-green-500',
  rare: 'from-blue-400 to-blue-500',
  epic: 'from-purple-400 to-purple-500',
  legendary: 'from-yellow-400 to-orange-500',
};

const rarityBorders = {
  common: 'border-gray-500/30',
  uncommon: 'border-green-500/30',
  rare: 'border-blue-500/30',
  epic: 'border-purple-500/30',
  legendary: 'border-yellow-500/30',
};

export function Marketplace() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [ships, setShips] = useState(mockShips);
  const [selectedShip, setSelectedShip] = useState(null);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const filteredShips = filter === 'all' 
    ? ships 
    : ships.filter(ship => ship.type === filter);

  const handleBuy = async (ship) => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    setIsLoading(true);
    // Simulate transaction
    setTimeout(() => {
      alert(`Purchase initiated for ${ship.name} at ${ship.price} ETH`);
      setIsLoading(false);
    }, 1500);
  };

  const handleList = (ship) => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    const price = prompt(`Enter listing price in ETH for ${ship.name}:`);
    if (price) {
      alert(`${ship.name} listed for ${price} ETH`);
    }
  };

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">NFT Marketplace</h1>
          <p className="text-gray-400">Trade your space ships on Base Sepolia</p>
        </div>

        <div className="glass rounded-xl p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Connect your wallet to browse, buy, and sell NFT ships on the marketplace.
            We support MetaMask, Coinbase Wallet, and other injected wallets.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => connect({ connector })}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
              >
                <Wallet className="w-5 h-5" />
                <span>Connect {connector.name}</span>
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-6">
            Network: Base Sepolia Testnet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">NFT Marketplace</h1>
          <p className="text-gray-400">Trade your space ships on Base Sepolia</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="glass rounded-lg px-4 py-2 flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-mono">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
          </div>
          <button
            onClick={() => disconnect()}
            className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-sm"
          >
            Disconnect
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4">
          <div className="text-sm text-gray-400">Listed Ships</div>
          <div className="text-2xl font-bold">{ships.length}</div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="text-sm text-gray-400">Floor Price</div>
          <div className="text-2xl font-bold text-green-400">0.02 ETH</div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="text-sm text-gray-400">Total Volume</div>
          <div className="text-2xl font-bold">12.5 ETH</div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="text-sm text-gray-400">Network</div>
          <div className="text-2xl font-bold text-blue-400">Base Sepolia</div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4">
        <div className="flex flex-wrap gap-2">
          {['all', 'explorer', 'fighter', 'transport', 'mining'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === type
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
          <button
            onClick={() => setShips([...mockShips])}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white/5 text-gray-300 hover:bg-white/10 ml-auto flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Ship Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredShips.map((ship) => (
          <div
            key={ship.id}
            className={`glass rounded-xl overflow-hidden border-2 ${rarityBorders[ship.rarity]} hover:scale-[1.02] transition-transform cursor-pointer`}
            onClick={() => setSelectedShip(ship)}
          >
            {/* Ship Image/Icon */}
            <div className="h-40 bg-gradient-to-br from-space-800 to-space-900 flex items-center justify-center relative">
              <span className="text-7xl">{ship.image}</span>
              <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${rarityColors[ship.rarity]} text-white`}>
                {ship.rarity.toUpperCase()}
              </div>
            </div>

            {/* Ship Info */}
            <div className="p-4">
              <h3 className="text-lg font-bold mb-1">{ship.name}</h3>
              <p className="text-sm text-gray-400 capitalize mb-3">{ship.type} Class</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 bg-white/5 rounded-lg">
                  <div className="text-xs text-gray-400">Speed</div>
                  <div className="text-sm font-bold text-blue-400">{ship.stats.speed}</div>
                </div>
                <div className="text-center p-2 bg-white/5 rounded-lg">
                  <div className="text-xs text-gray-400">Cargo</div>
                  <div className="text-sm font-bold text-green-400">{ship.stats.cargo}</div>
                </div>
                <div className="text-center p-2 bg-white/5 rounded-lg">
                  <div className="text-xs text-gray-400">Armor</div>
                  <div className="text-sm font-bold text-purple-400">{ship.stats.armor}</div>
                </div>
              </div>

              {/* Price and Actions */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-400">Price</div>
                  <div className="text-xl font-bold text-green-400">{ship.price} ETH</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBuy(ship);
                  }}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center space-x-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Buy</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredShips.length === 0 && (
        <div className="glass rounded-xl p-12 text-center">
          <p className="text-gray-400">No ships found for this filter</p>
        </div>
      )}

      {/* Selected Ship Modal */}
      {selectedShip && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedShip(null)}>
          <div className="glass rounded-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold">{selectedShip.name}</h2>
                <p className="text-gray-400 capitalize">{selectedShip.type} Class • {selectedShip.rarity}</p>
              </div>
              <button onClick={() => setSelectedShip(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="h-48 bg-gradient-to-br from-space-800 to-space-900 rounded-xl flex items-center justify-center mb-4">
              <span className="text-8xl">{selectedShip.image}</span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <div className="text-sm text-gray-400">Speed</div>
                <div className="text-xl font-bold text-blue-400">{selectedShip.stats.speed}</div>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <div className="text-sm text-gray-400">Cargo</div>
                <div className="text-xl font-bold text-green-400">{selectedShip.stats.cargo}</div>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <div className="text-sm text-gray-400">Armor</div>
                <div className="text-xl font-bold text-purple-400">{selectedShip.stats.armor}</div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-gray-400">Current Price</div>
                <div className="text-3xl font-bold text-green-400">{selectedShip.price} ETH</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleBuy(selectedShip)}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Buy Now</span>
              </button>
              <button
                onClick={() => handleList(selectedShip)}
                className="px-6 py-3 bg-white/10 rounded-lg font-medium hover:bg-white/20 transition-colors flex items-center space-x-2"
              >
                <Tag className="w-5 h-5" />
                <span>List for Sale</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
