import React, { useEffect, useState } from 'react';
import { Users, MapPin, ArrowRight } from 'lucide-react';
import axios from 'axios';

export function Galaxy() {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const response = await axios.get('/api/stations');
      setStations(response.data);
    } catch (error) {
      console.error('Error fetching stations:', error);
    }
  };

  const handleStationClick = (station) => {
    setSelectedStation(station);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Galaxy View</h1>
        <p className="text-gray-400">Explore and manage your stations across the galaxy</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-xl p-6">
          <div className="h-96 bg-space-800/50 rounded-lg flex items-center justify-center relative overflow-hidden">
            {stations.length === 0 ? (
              <div className="text-center text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No stations discovered yet</p>
              </div>
            ) : (
              <div className="absolute inset-0">
                {/* Starfield background */}
                {[...Array(50)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full opacity-50"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animation: `twinkle ${2 + Math.random() * 3}s infinite alternate`
                    }}
                  />
                ))}

                {/* Station markers */}
                {stations.map((station) => (
                  <div
                    key={station.id}
                    className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group"
                    style={{
                      left: `${50 + (station.location.x / 1000) * 50}%`,
                      top: `${50 + (station.location.y / 1000) * 50}%`
                    }}
                    onClick={() => handleStationClick(station)}
                  >
                    <div className="relative">
                      {/* Station marker */}
                      <div className="w-4 h-4 bg-blue-500 rounded-full glow"></div>
                      {/* Selection ring */}
                      <div className={`absolute inset-0 rounded-full border-2 transition-all ${
                        selectedStation?.id === station.id
                          ? 'border-blue-400 scale-125'
                          : 'border-blue-500 scale-0 group-hover:scale-125'
                      }`}></div>
                    </div>
                  </div>
                ))}

                {/* Animated lines between stations */}
                {stations.length > 1 && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {stations.map((station, i) => {
                      const nextStation = stations[(i + 1) % stations.length];
                      return (
                        <line
                          key={`${station.id}-${nextStation.id}`}
                          x1={`${50 + (station.location.x / 1000) * 50}%`}
                          y1={`${50 + (station.location.y / 1000) * 50}%`}
                          x2={`${50 + (nextStation.location.x / 1000) * 50}%`}
                          y2={`${50 + (nextStation.location.y / 1000) * 50}%`}
                          stroke="rgba(59, 130, 246, 0.2)"
                          strokeWidth="1"
                        />
                      );
                    })}
                  </svg>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Stations</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {stations.map((station) => (
              <div
                key={station.id}
                onClick={() => handleStationClick(station)}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  selectedStation?.id === station.id
                    ? 'bg-blue-500/20 border border-blue-500/50'
                    : 'bg-white/5 hover:bg-white/10 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{station.name}</span>
                  <MapPin className="w-4 h-4 text-gray-500" />
                </div>
                <div className="text-sm text-gray-400">
                  {station.resources?.length || 0} resources
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedStation && (
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{selectedStation.name}</h2>
            <button
              onClick={() => setSelectedStation(null)}
              className="text-gray-400 hover:text-white"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-400">Balance</div>
              <div className="text-xl font-bold text-green-400">
                ${selectedStation.balance?.toLocaleString() || 0}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Resources</div>
              <div className="text-xl font-bold">
                {selectedStation.resources?.length || 0}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Fleets</div>
              <div className="text-xl font-bold">
                {selectedStation.fleets?.length || 0}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Location</div>
              <div className="text-xl font-bold">
                Sector {selectedStation.location?.sector || 0}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
