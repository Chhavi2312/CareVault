import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import multer from 'multer';
import { db } from './src/db/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

app.use(express.json());

// Set up multer for file uploads
let uploadDir = path.join(process.cwd(), 'uploads');
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  // Test write access
  fs.accessSync(uploadDir, fs.constants.W_OK);
} catch (err) {
  console.warn('Upload directory is not writable, falling back to /tmp/uploads');
  const tmpUploadDir = path.join('/tmp', 'uploads');
  
  if (!fs.existsSync(tmpUploadDir)) {
    fs.mkdirSync(tmpUploadDir, { recursive: true });
  }
  
  // Copy existing files if they exist
  if (fs.existsSync(uploadDir)) {
    const files = fs.readdirSync(uploadDir);
    for (const file of files) {
      const srcPath = path.join(uploadDir, file);
      const destPath = path.join(tmpUploadDir, file);
      if (!fs.existsSync(destPath) && fs.statSync(srcPath).isFile()) {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
  
  uploadDir = tmpUploadDir;
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// API Routes
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const stmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    const info = stmt.run(name, email, hashedPassword);
    const token = jwt.sign({ id: info.lastInsertRowid, email }, JWT_SECRET);
    res.json({ token, user: { id: info.lastInsertRowid, name, email } });
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  const user = stmt.get(email) as any;

  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/api/auth/me', authenticateToken, (req: any, res) => {
  const stmt = db.prepare('SELECT id, name, email FROM users WHERE id = ?');
  const user = stmt.get(req.user.id);
  res.json({ user });
});

// Family Members
app.get('/api/members', authenticateToken, (req: any, res) => {
  const stmt = db.prepare('SELECT * FROM members WHERE user_id = ?');
  const members = stmt.all(req.user.id);
  res.json(members);
});

app.post('/api/members', authenticateToken, (req: any, res) => {
  const { name, relation, dob, gender, blood_group } = req.body;
  const stmt = db.prepare('INSERT INTO members (user_id, name, relation, dob, gender, blood_group) VALUES (?, ?, ?, ?, ?, ?)');
  const info = stmt.run(req.user.id, name, relation, dob, gender, blood_group);
  res.json({ id: info.lastInsertRowid, name, relation, dob, gender, blood_group });
});

app.delete('/api/members/:id', authenticateToken, (req: any, res) => {
  const stmt = db.prepare('DELETE FROM members WHERE id = ? AND user_id = ?');
  stmt.run(req.params.id, req.user.id);
  res.json({ success: true });
});

// Documents
app.get('/api/documents', authenticateToken, (req: any, res) => {
  const stmt = db.prepare('SELECT * FROM documents WHERE user_id = ? ORDER BY created_at DESC');
  const documents = stmt.all(req.user.id);
  res.json(documents);
});

app.post('/api/documents', authenticateToken, upload.single('file'), async (req: any, res) => {
  const { member_id, title, type } = req.body;
  const file = req.file;
  
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileUrl = `/uploads/${file.filename}`;
  const stmt = db.prepare('INSERT INTO documents (user_id, member_id, title, type, file_url, original_name, mime_type) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const info = stmt.run(req.user.id, member_id, title, type, fileUrl, file.originalname, file.mimetype);
  
  const documentId = info.lastInsertRowid;
  
  res.json({ id: documentId, member_id, title, type, file_url: fileUrl, status: 'pending' });
});

app.put('/api/documents/:id/analysis', authenticateToken, (req: any, res) => {
  const { summary, precautions, risks, status } = req.body;
  const stmt = db.prepare('UPDATE documents SET status = ?, analysis_summary = ?, analysis_precautions = ?, analysis_risks = ? WHERE id = ? AND user_id = ?');
  stmt.run(status, summary, JSON.stringify(precautions || []), JSON.stringify(risks || []), req.params.id, req.user.id);
  res.json({ success: true });
});

app.get('/api/documents/:id', authenticateToken, (req: any, res) => {
  const stmt = db.prepare('SELECT * FROM documents WHERE id = ? AND user_id = ?');
  const document = stmt.get(req.params.id, req.user.id);
  if (!document) return res.status(404).json({ error: 'Not found' });
  res.json(document);
});

app.delete('/api/documents/:id', authenticateToken, (req: any, res) => {
  try {
    const getStmt = db.prepare('SELECT file_url FROM documents WHERE id = ? AND user_id = ?');
    const document = getStmt.get(req.params.id, req.user.id) as any;
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const stmt = db.prepare('DELETE FROM documents WHERE id = ? AND user_id = ?');
    stmt.run(req.params.id, req.user.id);
    
    if (document.file_url) {
      const fileName = document.file_url.split('/').pop();
      if (fileName) {
        const filePath = path.join(uploadDir, fileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// Serve uploaded files
app.use('/uploads', express.static(uploadDir));

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
