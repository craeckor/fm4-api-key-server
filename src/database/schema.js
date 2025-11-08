export const createTables = (db) => {
  // Program keys table - stores unique program keys with metadata
  db.exec(`
    CREATE TABLE IF NOT EXISTS program_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      program_key TEXT NOT NULL UNIQUE,
      description TEXT,
      title TEXT,
      subtitle TEXT,
      first_seen INTEGER DEFAULT (strftime('%s', 'now')),
      last_seen INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);

  // Create index for faster lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_program_key ON program_keys(program_key);
  `);

  // Create index for sorting by last seen
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_last_seen ON program_keys(last_seen);
  `);
};
