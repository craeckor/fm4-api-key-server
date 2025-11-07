import db from '../database/database.js';

async function initDatabase() {
  try {
    console.log('Initializing FM4 Key Server database...');
    
    db.initialize();
    
    console.log('Database initialized successfully');
    console.log('Database location: ' + db.db.name);
    console.log('Database initialization complete!');
    
    db.close();
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

initDatabase();
