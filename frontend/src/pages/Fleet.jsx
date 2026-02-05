import React, { useEffect, useState } from 'react';
import { Settings, Plane, Shield, Database, Activity } from 'lucide-react';
import axios from 'axios';

export function Fleet() {
  const [fleets, setFleets] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, docked: 0 });

  useEffect(() => {
    fetchFleetData();
  }, []);

  const fetchFleetData = async () => {
    try {
      const [fleetsRes, statsRes] = await Promise.all([
        axios.get('/api/fleets'),
        axios.get('/api/fleets/stats')
      ]);

      setFleets(fleetsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching fleet data:', error);
    }
  };

  const getFleetIcon = (type) => {
    switch (type) {
      case 'explorer': return '🚀';
      case 'transport': return '🛸';
      case 'fighter': return '🛡️';
      case 'mining': return '⛏️';
      default: return '✈️';
    }
  };

  const getFleetStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'returning': return 'text-yellow-400';
      case 'docked': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Fleet Command</h1>
        <p className="text-gray-400">Manage your space fleet and missions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
              <Plane className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Total Fleets</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
              <Activity className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Active Missions</div>
              <div className="text-2xl font-bold text-green-400">{stats.active}</div>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">
              <Database className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Docked</div>
              <div className="text-2xl font-bold text-blue-400">{stats.docked}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">Your Fleet</h2>
        <div className="space-y-3">
          {fleets.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Plane className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No fleets assigned</p>
              <p className="text-sm">Create a new fleet from a station</p>
            </div>
          ) : (
            fleets.map((fleet) => (
              <div
                key={fleet.id}
                className={`flex items-center justify-between p-4 bg-white/5 rounded-lg ${
                  fleet.status === 'active' ? 'border-l-4 border-green-500' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <span className="text-2xl">{getFleetIcon(fleet.type)}</span>
                  <div>
                    <div className="font-medium">{fleet.name}</div>
                    <div className="text-sm text-gray-400">{fleet.type} • {fleet.crewSize} crew</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className={`text-sm font-medium ${getFleetStatusColor(fleet.status)}`}>
                    {fleet.status === 'active' ? '🚀 Active' : '⚓ Docked'}
                  </div>
                  {fleet.status !== 'active' && (
                    <button className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 text-sm">
                      Deploy
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">Fleet Types</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 bg-white/5 rounded-lg text-center">
            <div className="text-2xl mb-2">🚀</div>
            <div className="text-sm font-medium">Explorers</div>
            <div className="text-xs text-gray-500">Explore new sectors</div>
          </div>
          <div className="p-4 bg-white/5 rounded-lg text-center">
            <div className="text-2xl mb-2">🛸</div>
            <div className="text-sm font-medium">Transports</div>
            <div className="text-xs text-gray-500">Move resources</div>
          </div>
          <div className="p-4 bg-white/5 rounded-lg text-center">
            <div className="text-2xl mb-2">🛡️</div>
            <div className="text-sm font-medium">Fighters</div>
            <div className="text-xs text-gray-500">Combat vessels</div>
          </div>
          <div className="p-4 bg-white/5 rounded-lg text-center">
            <div className="text-2xl mb-2">⛏️</div>
            <div className="text-sm font-medium">Mining</div>
            <div className="text-xs text-gray-500">Resource extraction</div>
          </div>
        </div>
      </div>
    </div>
  );
}
