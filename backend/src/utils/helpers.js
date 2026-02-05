// Helper functions for the game

// Calculate distance between two coordinates (simplified)
const calculateDistance = (coords1, coords2) => {
  const x1 = coords1.x || coords1.coordinates[0];
  const y1 = coords1.y || coords1.coordinates[1];
  const x2 = coords2.x || coords2.coordinates[0];
  const y2 = coords2.y || coords2.coordinates[1];
  
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

// Generate random station location
const generateLocation = () => {
  const sector = Math.floor(Math.random() * 1000);
  const x = (Math.random() * 1000 - 500).toFixed(2);
  const y = (Math.random() * 1000 - 500).toFixed(2);
  
  return {
    x: parseFloat(x),
    y: parseFloat(y),
    sector,
    coordinates: [parseFloat(x), parseFloat(y)]
  };
};

// Generate station name
const generateStationName = () => {
  const prefixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Omega', 'Nova', 'Stellar', 'Galactic'];
  const suffixes = ['Prime', 'Station', 'Outpost', 'Refinery', 'Mining Colony', 'Research Center', 'Trade Hub', 'Depot'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  const number = Math.floor(Math.random() * 999);
  
  return `${prefix} ${suffix} ${number}`;
};

// Format date for display
const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('en-US', options);
};

// Calculate contract duration
const calculateContractDuration = (days = 30) => {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);
  return {
    startDate: new Date().toISOString(),
    endDate: endDate.toISOString()
  };
};

// Validate resource type
const validateResourceType = (type) => {
  const validTypes = ['mineral', 'energy', 'rare-earth', 'organic', 'data'];
  return validTypes.includes(type);
};

module.exports = {
  calculateDistance,
  generateLocation,
  generateStationName,
  formatDate,
  calculateContractDuration,
  validateResourceType
};
