import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Settings, Users } from 'lucide-react';

export function Navigation() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const navItems = [
    { path: '/', icon: Search, label: 'Dashboard' },
    { path: '/galaxy', icon: Users, label: 'Galaxy' },
    { path: '/fleet', icon: Settings, label: 'Fleet' },
    { path: '/marketplace', icon: Settings, label: 'Marketplace' },
  ];

  return (
    <nav className="glass border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Oclawd
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
        </div>
      </div>
    </nav>
  );
}
