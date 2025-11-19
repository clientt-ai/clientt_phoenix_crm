// @ts-check
const { execSync } = require('child_process');
const path = require('path');

/**
 * Global setup for Playwright tests
 *
 * This runs before any tests and ensures the database is seeded
 * with the test user accounts.
 */
async function globalSetup() {
  const appDir = path.join(__dirname, '..', 'clientt_crm_app');

  console.log('\n🌱 Running database seeds...');

  try {
    // Just run seeds to create test users
    // The webServer command will handle compilation and server startup
    console.log('  🌱 Running seeds...');
    execSync('mix run priv/repo/seeds.exs', {
      cwd: appDir,
      stdio: 'inherit',
      timeout: 120000
    });

    console.log('  ✅ Database seeding complete!\n');
  } catch (error) {
    console.error('  ❌ Database seeding failed:', error.message);
    // Don't throw - the server might already have data
    console.log('  ⚠️ Continuing with existing database state...\n');
  }
}

module.exports = globalSetup;
