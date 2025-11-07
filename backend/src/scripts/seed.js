import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runSeeds() {
  try {
    console.log('🌱 Starting database seeding...');

    const seedsDir = path.join(__dirname, '../../database/seeds');
    const seedFiles = fs
      .readdirSync(seedsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of seedFiles) {
      console.log(`📝 Running seed: ${file}`);
      const filePath = path.join(seedsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      // Note: This is a simplified approach
      // In production, you'd want to handle this more carefully
      console.log('⚠️  Seeds need to be run manually in Supabase SQL Editor');
      console.log('📁 Location:', filePath);
    }

    console.log('🎉 Seed files identified. Run them in Supabase SQL Editor.');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

runSeeds();
