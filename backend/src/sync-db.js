#!/usr/bin/env node
/**
 * Database sync script
 * Creates/updates tables based on Sequelize models
 * 
 * Usage:
 *   node src/sync-db.js        # Safe sync (no data loss)
 *   node src/sync-db.js --force # Drop and recreate (WARNING: data loss!)
 */

require('dotenv').config();
const { sequelize } = require('./models');

const force = process.argv.includes('--force');
const alter = process.argv.includes('--alter');

async function syncDatabase() {
  console.log('🔄 Syncing database...');
  console.log(`   Mode: ${force ? 'FORCE (drop & recreate)' : alter ? 'ALTER (modify existing)' : 'SAFE (create only)'}`);
  
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    if (force) {
      console.log('⚠️  WARNING: Force mode will DROP all tables!');
      console.log('   Waiting 3 seconds... Press Ctrl+C to abort');
      await new Promise(r => setTimeout(r, 3000));
    }

    await sequelize.sync({ force, alter });
    
    console.log('✅ Database synced successfully');
    console.log('\nTables:');
    
    const [results] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    results.forEach(r => console.log(`   - ${r.table_name}`));

  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

syncDatabase();
