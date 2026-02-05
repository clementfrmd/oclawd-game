import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Settings, Users, ShoppingCart, Wallet } from 'lucide-react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [showDropdown, setShowDropdown] = useState(false);

  if (isConnected) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-2 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
        >
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-mono">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
        </button>
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 glass rounded-lg py-2 shadow-xl">
            <button
              onClick={() => {
                disconnect();
                setShowDropdown(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/10"
            >
              Disconnect Wallet
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:opacity-90 transition-opacity"
      >
        <Wallet className="w-4 h-4" />
        <span className="text-sm font-medium">Connect</span>
      </button>
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-56 glass rounded-lg py-2 shadow-xl">
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              onClick={() => {
                connect({ connector });
                setShowDropdown(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 flex items-center space-x-2"
            >
              <Wallet className="w-4 h-4" />
              <span>{connector.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Navigation() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const navItems = [
    { path: '/', icon: Search, label: 'Dashboard' },
    { path: '/galaxy', icon: Users, label: 'Galaxy' },
    { path: '/fleet', icon: Settings, label: 'Fleet' },
    { path: '/marketplace', icon: ShoppingCart, label: 'Marketplace' },
  ];

  return (
    <nav className="glass border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-lg flex items-center justify-center text-sm">🌌</div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Void Conquest
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.label.toLowerCase();
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setActiveTab(item.label.toLowerCase())}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-white/10 text-blue-400'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          <ConnectWallet />
        </div>
      </div>
    </nav>
  );
}
