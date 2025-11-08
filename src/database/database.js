import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import config from '../config/config.js';
import { createTables } from './schema.js';

class DatabaseService {
  constructor() {
    this.db = null;
  }

  initialize() {
    const dbPath = config.database.path;
    const dbDir = dirname(dbPath);

    // Ensure directory exists
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true });
    }

    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('synchronous = NORMAL');
    this.db.pragma('cache_size = -64000'); // 64MB cache

    // Create tables
    createTables(this.db);

    console.log(`Database initialized at: ${dbPath}`);
  }

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  // Insert or update a program key
  upsertProgramKey(programKey, description = null, title = null, subtitle = null) {
    const stmt = this.db.prepare(`
      INSERT INTO program_keys (program_key, description, title, subtitle, last_seen, updated_at)
      VALUES (?, ?, ?, ?, strftime('%s', 'now'), strftime('%s', 'now'))
      ON CONFLICT(program_key) DO UPDATE SET
        description = COALESCE(excluded.description, description),
        title = COALESCE(excluded.title, title),
        subtitle = COALESCE(excluded.subtitle, subtitle),
        last_seen = strftime('%s', 'now'),
        updated_at = strftime('%s', 'now')
    `);
    
    return stmt.run(programKey, description, title, subtitle);
  }

  // Get all program keys
  getAllProgramKeys() {
    return this.db.prepare(`
      SELECT 
        program_key,
        description,
        title,
        subtitle,
        first_seen,
        last_seen,
        updated_at
      FROM program_keys
      ORDER BY program_key ASC
    `).all();
  }

  // Get a single program key
  getProgramKey(programKey) {
    return this.db.prepare(`
      SELECT 
        program_key,
        description,
        title,
        subtitle,
        first_seen,
        last_seen,
        updated_at
      FROM program_keys
      WHERE program_key = ?
    `).get(programKey);
  }

  // Get statistics
  getStats() {
    const totalKeys = this.db.prepare('SELECT COUNT(*) as count FROM program_keys').get();
    const recentKeys = this.db.prepare(`
      SELECT COUNT(*) as count FROM program_keys 
      WHERE last_seen > strftime('%s', 'now') - 86400
    `).get();

    return {
      totalKeys: totalKeys.count,
      recentKeys: recentKeys.count,
      lastUpdate: this.db.prepare('SELECT MAX(updated_at) as last FROM program_keys').get()?.last
    };
  }
}

export default new DatabaseService();
