import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let dbDir = path.join(process.cwd(), 'data');
let dbPath = path.join(dbDir, 'carevault.db');

try {
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  // Test write access to directory
  fs.accessSync(dbDir, fs.constants.W_OK);
  
  // Test write access to file if it exists
  if (fs.existsSync(dbPath)) {
    fs.accessSync(dbPath, fs.constants.W_OK);
  }
} catch (err) {
  console.warn('Data directory or database file is not writable, falling back to /tmp/data');
  const tmpDbDir = path.join('/tmp', 'data');
  const tmpDbPath = path.join(tmpDbDir, 'carevault.db');
  
  if (!fs.existsSync(tmpDbDir)) {
    fs.mkdirSync(tmpDbDir, { recursive: true });
  }
  
  // Copy existing database if it exists and we haven't already copied it
  if (fs.existsSync(dbPath) && !fs.existsSync(tmpDbPath)) {
    console.log('Copying existing database to /tmp/data');
    fs.copyFileSync(dbPath, tmpDbPath);
  }
  
  dbDir = tmpDbDir;
  dbPath = tmpDbPath;
}

const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    relation TEXT NOT NULL,
    dob TEXT,
    gender TEXT,
    blood_group TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    member_id INTEGER,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    file_url TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, analyzing, completed, failed
    analysis_summary TEXT,
    analysis_precautions TEXT, -- JSON array
    analysis_risks TEXT, -- JSON array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members (id) ON DELETE SET NULL
  );
`);

export { db };
