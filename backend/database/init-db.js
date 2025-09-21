const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('../config');

const dbPath = path.resolve(__dirname, 'waiter_fm.db');
const db = new sqlite3.Database(dbPath);

// Create tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      first_name TEXT,
      last_name TEXT,
      role TEXT NOT NULL DEFAULT 'waiter',
      restaurant_id TEXT,
      google_id TEXT UNIQUE,
      profile_picture TEXT,
      login_count INTEGER DEFAULT 0,
      last_login DATETIME,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Competitions table
  db.run(`
    CREATE TABLE IF NOT EXISTS competitions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item TEXT NOT NULL,
      target_quantity INTEGER NOT NULL,
      prize DECIMAL(10,2) NOT NULL,
      description TEXT NOT NULL,
      is_active BOOLEAN DEFAULT 0,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users (id)
    )
  `);

  // Competition participation table
  db.run(`
    CREATE TABLE IF NOT EXISTS competition_participation (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      competition_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      is_participating BOOLEAN DEFAULT 0,
      actual_quantity INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (competition_id) REFERENCES competitions (id),
      FOREIGN KEY (user_id) REFERENCES users (id),
      UNIQUE(competition_id, user_id)
    )
  `);

  // Waiters table (for the original waiter names)
  db.run(`
    CREATE TABLE IF NOT EXISTS waiters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User login history table
  db.run(`
    CREATE TABLE IF NOT EXISTS user_login_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      ip_address TEXT,
      user_agent TEXT,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Insert some sample waiters
  const sampleWaiters = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry'];
  const stmt = db.prepare('INSERT OR IGNORE INTO waiters (name) VALUES (?)');
  sampleWaiters.forEach(waiter => {
    stmt.run(waiter);
  });
  stmt.finalize();

  // Insert a sample admin user (password: admin123)
  const bcrypt = require('bcryptjs');
  const adminPasswordHash = bcrypt.hashSync('admin123', 10);
  db.run(`
    INSERT OR IGNORE INTO users (username, email, password_hash, first_name, last_name, role) 
    VALUES ('admin', 'admin@waiterfm.com', ?, 'Admin', 'User', 'admin')
  `, [adminPasswordHash]);

  console.log('Database initialized successfully!');
  console.log('Sample admin user created:');
  console.log('Username: admin');
  console.log('Password: admin123');
});

db.close();
