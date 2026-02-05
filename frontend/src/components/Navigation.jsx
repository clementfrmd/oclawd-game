import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Globe, Rocket, Building2, FlaskConical, Shield, ShoppingCart, Wallet, Menu, X } from 'lucide-react';
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
          className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded text-green-400 hover:bg-green-500/30 transition-all"
        >
          <span className="w-2 h-2 bg-green-400 rounded-full pulse-glow" />
          <span className="font-mono text-sm">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
        </button>
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 panel rounded py-2 z-50">
            <button
              onClick={() => {
                disconnect();
                setShowDropdown(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/10 transition-colors"
            >
              Disconnect
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
        className="btn-primary flex items-center gap-2 py-2 px-4 text-sm"
      >
        <Wallet className="w-4 h-4" />
        <span>Connect</span>
      </button>
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-56 panel rounded py-2 z-50">
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              onClick={() => {
                connect({ connector });
                setShowDropdown(false);
              }}
              className="w-full text-left px-4 py-3 text-sm hover:bg-white/10 flex items-center gap-3 transition-colors"
            >
              <Wallet className="w-4 h-4 text-cyan-400" />
              <span>{connector.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Navigation() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Command' },
    { path: '/galaxy', icon: Globe, label: 'Galaxy' },
    { path: '/fleet', icon: Rocket, label: 'Fleet' },
    { path: '/facilities', icon: Building2, label: 'Facilities' },
    { path: '/research', icon: FlaskConical, label: 'Research' },
    { path: '/defense', icon: Shield, label: 'Defense' },
    { path: '/marketplace', icon: ShoppingCart, label: 'Market' },
  ];

  // Don't show nav on landing page
  if (location.pathname === '/') {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="text-3xl">🌌</span>
            <span className="font-display text-2xl font-bold text-white">
              VOID <span className="text-cyan-400">CONQUEST</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="btn-secondary py-2 px-4 text-sm hidden sm:block">
              Launch Game
            </Link>
            <ConnectWallet />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">🌌</span>
              <span className="font-display text-xl font-bold hidden sm:block">
                VOID <span className="text-cyan-400">CONQUEST</span>
              </span>
            </Link>

            {/* Desktop Nav Items */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded transition-all ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              <ConnectWallet />
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-400 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-cyan-500/20 bg-black/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded transition-all ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>
      
      {/* Spacer for fixed nav */}
      <div className="h-16" />
    </>
  );
}
