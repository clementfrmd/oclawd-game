import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Box, Plane, DollarSign, TrendingUp } from 'lucide-react';
import axios from 'axios';

export function Dashboard() {
  const [stats, setStats] = useState({
    stations: 0,
    resources: 0,
    fleets: 0,
    balance: 0
  });
  const [marketPrices, setMarketPrices] = useState({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, pricesRes] = await Promise.all([
        axios.get('/api/stations'),
        axios.get('/api/marketplace/type/mineral')
      ]);

      setStats({
        stations: statsRes.data.length,
        resources: statsRes.data.reduce((acc, station) => acc + station.resources.length, 0),
        fleets: statsRes.data.reduce((acc, station) => acc + station.fleets.length, 0),
        balance: statsRes.data.reduce((acc, station) => acc + station.balance, 0)
      });

      const mineralMarket = pricesRes.data;
      setMarketPrices({
        mineral: mineralMarket?.currentPrice || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Command Dashboard</h1>
        <p className="text-gray-400">Overview of your space empire</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Stations"
          value={stats.stations}
          icon={Activity}
          color="blue"
        />
        <StatCard
          title="Resources"
          value={stats.resources}
          icon={Box}
          color="green"
        />
        <StatCard
          title="Fleets"
          value={stats.fleets}
          icon={Plane}
          color="purple"
        />
        <StatCard
          title="Balance"
          value={`$${stats.balance.toLocaleString()}`}
          icon={DollarSign}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
            Market Prices
          </h2>
          <div className="space-y-4">
            {Object.entries(marketPrices).map(([type, price]) => (
              <div key={type} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="capitalize font-medium">{type}</span>
                <span className="text-green-400 font-bold">${price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/marketplace"
              className="p-4 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors text-center"
            >
              <span className="block text-2xl mb-2">🛒</span>
              <span className="text-sm font-medium">Trade Resources</span>
            </Link>
            <Link
              to="/fleet"
              className="p-4 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors text-center"
            >
              <span className="block text-2xl mb-2">🚀</span>
              <span className="text-sm font-medium">Manage Fleets</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    yellow: 'from-yellow-500 to-yellow-600'
  };

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm">{title}</span>
        <div className={`w-10 h-10 bg-gradient-to-br ${colors[color]} rounded-lg flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}
