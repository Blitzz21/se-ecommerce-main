#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase environment variables');
  process.exit(1);
}

// Initialize Supabase client with service role key for admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Get current file directory (ES modules don't have __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration(filePath) {
  try {
    console.log(`Running migration: ${filePath}`);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Run migration using the Supabase SQL endpoint
    const { error } = await supabase.rpc('execute_sql', { sql });
    
    if (error) {
      console.error(`Migration failed for ${filePath}:`, error);
      return false;
    }
    
    console.log(`Migration successful: ${filePath}`);
    return true;
  } catch (err) {
    console.error(`Error running migration ${filePath}:`, err);
    return false;
  }
}

async function runMigrations() {
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  
  try {
    // Get all .sql files from the migrations directory
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ensure migrations run in order
    
    console.log(`Found ${files.length} migration files to process`);
    
    let successCount = 0;
    let failCount = 0;
    
    // Run each migration file
    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const success = await runMigration(filePath);
      
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }
    
    console.log(`Migration complete. ${successCount} successful, ${failCount} failed.`);
  } catch (err) {
    console.error('Error running migrations:', err);
    process.exit(1);
  }
}

// Run migrations
runMigrations(); 