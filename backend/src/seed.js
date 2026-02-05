require('dotenv').config();
const { sequelize } = require('./config/database');

// Helper function to create database tables
async function createDatabase() {
  try {
    console.log('Creating database...');
    const { execSync } = require('child_process');
    
    // Try to create database if it doesn't exist
    try {
      execSync(`createdb "${process.env.DB_NAME}"`);
      console.log(`Database "${process.env.DB_NAME}" created`);
    } catch (error) {
      // Database might already exist
      if (error.message.includes('already exists')) {
        console.log(`Database "${process.env.DB_NAME}" already exists`);
      } else {
        console.log('Continuing with existing database');
      }
    }
    
    await sequelize.authenticate();
    console.log('Database connection established');
    
    // Create tables
    await sequelize.sync({ alter: true });
    console.log('Tables created successfully');
    
    return true;
  } catch (error) {
    console.error('Error creating database:', error);
    return false;
  }
}

// Seed initial data
async function seedData() {
  try {
    const { Station, Resource, Marketplace, Fleet, Contract } = require('./models');
    
    // Create marketplaces
    const resourceTypes = ['mineral', 'energy', 'rare-earth', 'organic', 'data'];
    
    console.log('Creating marketplaces...');
    for (const type of resourceTypes) {
      await Marketplace.findOrCreate({
        where: { resourceType: type },
        defaults: {
          basePrice: Math.random() * 100 + 10,
          volatility: 0.1,
          spread: 0.02
        }
      });
    }
    console.log('Marketplaces created');
    
    // Create sample stations
    console.log('Creating sample stations...');
    const stationNames = [
      'Alpha Prime Station',
      'Beta Outpost',
      'Gamma Refinery',
      'Delta Mining Colony',
      'Epsilon Research Center'
    ];
    
    for (const name of stationNames) {
      const location = {
        x: (Math.random() * 1000 - 500).toFixed(2),
        y: (Math.random() * 1000 - 500).toFixed(2),
        coordinates: [
          (Math.random() * 1000 - 500).toFixed(2),
          (Math.random() * 1000 - 500).toFixed(2)
        ]
      };
      
      await Station.findOrCreate({
        where: { name },
        defaults: {
          location: location,
          owner: 'player',
          balance: Math.random() * 100000
        }
      });
    }
    console.log('Stations created');
    
    // Create resources for each station
    console.log('Creating resources...');
    const stations = await Station.findAll();
    
    for (const station of stations) {
      const resourceTypes = ['mineral', 'energy', 'rare-earth'];
      for (const type of resourceTypes) {
        await Resource.findOrCreate({
          where: {
            name: `${type}-${station.id}`,
            stationId: station.id
          },
          defaults: {
            type: type,
            quantity: Math.random() * 1000,
            unitPrice: Math.random() * 10 + 1
          }
        });
      }
    }
    console.log('Resources created');
    
    // Create sample contracts
    console.log('Creating sample contracts...');
    const resources = await Resource.findAll({ limit: 5 });
    
    for (const resource of resources) {
      const contract = await Contract.findOrCreate({
        where: {
          resourceId: resource.id,
          stationId: resource.stationId
        },
        defaults: {
          type: ['buy', 'sell'][Math.floor(Math.random() * 2)],
          quantity: Math.random() * 100 + 10,
          unitPrice: resource.unitPrice,
          totalPrice: 0,
          status: 'pending',
          ...calculateContractDuration(30)
        }
      });
    }
    console.log('Contracts created');
    
    console.log('Data seeding completed!');
    return true;
  } catch (error) {
    console.error('Error seeding data:', error);
    return false;
  }
}

// Initialize
async function init() {
  console.log('=== Oclawd Database Initialization ===');
  
  const dbCreated = await createDatabase();
  if (!dbCreated) {
    console.error('Failed to create database');
    return;
  }
  
  // Only seed if tables are empty
  const stations = await require('./models').Station.count();
  if (stations === 0) {
    const seeded = await seedData();
    if (!seeded) {
      console.error('Failed to seed data');
    }
  } else {
    console.log('Database already has data, skipping seed');
  }
  
  process.exit(0);
}

// Helper function
function calculateContractDuration(days = 30) {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);
  return {
    startDate: new Date().toISOString(),
    endDate: endDate.toISOString()
  };
}

// Run initialization
init();
