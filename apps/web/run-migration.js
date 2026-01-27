#!/usr/bin/env node

/**
 * Run Supabase migration 042
 * This script executes the beta mode and teams migration
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Read environment variables
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL not found in .env.local');
  process.exit(1);
}

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  console.error('');
  console.error('To run migrations, you need the service role key from:');
  console.error('https://supabase.com/dashboard/project/cmsknsbsoyxezgaqalrc/settings/api');
  console.error('');
  console.error('Add it to .env.local as:');
  console.error('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
  console.error('');
  console.error('Alternatively, you can run this migration manually in the Supabase SQL Editor:');
  console.error('https://supabase.com/dashboard/project/cmsknsbsoyxezgaqalrc/sql/new');
  process.exit(1);
}

// Read migration file
const migrationPath = path.join(__dirname, 'supabase/migrations/042_beta_mode_and_teams.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

console.log('🚀 Running migration: 042_beta_mode_and_teams.sql');
console.log('');

// Extract project reference from URL
const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0];

// Prepare request
const requestData = JSON.stringify({ query: migrationSQL });

const options = {
  hostname: `${projectRef}.supabase.co`,
  path: '/rest/v1/rpc/exec_sql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': requestData.length,
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    'Prefer': 'return=representation'
  }
};

// Try alternative endpoint for running SQL
const altOptions = {
  hostname: `${projectRef}.supabase.co`,
  path: '/rest/v1/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
  }
};

console.log('📡 Connecting to Supabase...');
console.log('');

// Make request
const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ Migration completed successfully!');
      console.log('');
      console.log('Next steps:');
      console.log('1. Visit /admin/beta-codes to generate beta codes');
      console.log('2. Test the beta landing page at /beta-landing');
      console.log('3. Grant beta access to users at /admin (Users tab)');
      console.log('');
    } else {
      console.error('❌ Migration failed');
      console.error('Status:', res.statusCode);
      console.error('Response:', data);
      console.error('');
      console.error('Please run the migration manually in Supabase SQL Editor:');
      console.error('https://supabase.com/dashboard/project/cmsknsbsoyxezgaqalrc/sql/new');
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error running migration:', error.message);
  console.error('');
  console.error('Please run the migration manually in Supabase SQL Editor:');
  console.error('https://supabase.com/dashboard/project/cmsknsbsoyxezgaqalrc/sql/new');
  console.error('');
  console.error('Copy the contents of:');
  console.error(migrationPath);
  process.exit(1);
});

req.write(requestData);
req.end();
