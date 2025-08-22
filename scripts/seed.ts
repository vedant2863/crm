require('dotenv').config({ path: '.env' });

// Import the runSeed function directly and run it
const { runSeed } = require('../src/lib/seedData.ts');

runSeed();
