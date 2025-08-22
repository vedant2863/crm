require('dotenv').config({ path: '.env' });

// Import the seed function
const { runSeed } = require('../src/lib/seedData.ts');

// Run the seed
runSeed();
