import express from 'express';
import session from 'express-session';
import SQLiteStoreFactory from 'connect-sqlite3';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Carica variabili d'ambiente
dotenv.config();

// Configura i path per ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importa routes
import authRoutes from './routes/auth.js';
import missioniRoutes from './routes/missioni.js';
import completamentiRoutes from './routes/completamenti.js';
import usersRoutes from './routes/users.js';

const app = express();
const httpServer = createServer(app);

// Configura Socket.io
const io = new Server(httpServer, {
  cors: { origin: '*' } // O configura per ambiente specifico
});
app.set('io', io);

io.on('connection', (socket) => {
  console.log('Un client si è connesso:', socket.id);
  socket.on('disconnect', () => {
    console.log('Un client si è disconnesso:', socket.id);
  });
});

// Middleware standard
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve file statici
app.use('/favicon.ico', (req, res) => res.status(204).end());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configura Sessioni
const SQLiteStore = SQLiteStoreFactory(session);
app.use(session({
  store: new SQLiteStore({
    db: 'sessions.db',
    dir: path.join(__dirname, 'db')
  }),
  secret: process.env.SESSION_SECRET || 'fallbacksecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000 // 1 settimana
  }
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/missions', missioniRoutes);
app.use('/api/completions', completamentiRoutes);
app.use('/api/users', usersRoutes);

// Avvio server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
