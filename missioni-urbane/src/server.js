import express from 'express';
import session from 'express-session';
import SQLiteStoreFactory from 'connect-sqlite3';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { engine } from 'express-handlebars';
import { getAll } from './repositories/missions.repo.js';

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

// Configura Handlebars per SSR
app.engine('hbs', engine({ 
  extname: '.hbs', 
  defaultLayout: 'main',
  helpers: {
    eq: (a, b) => a === b
  }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../views'));

// Configura Socket.io
const io = new Server(httpServer, {
  cors: { origin: '*' }
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
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

// Middleware globale per i dati utente nelle viste
app.use((req, res, next) => {
  res.locals.user = req.session.userId ? { 
    id: req.session.userId, 
    role: req.session.role, 
    username: req.session.username 
  } : null;
  next();
});

// Home Page SSR
app.get('/', (req, res) => {
  try {
    const { category, difficulty } = req.query;
    const missions = getAll(category, difficulty);
    res.render('home', { missions, category, difficulty });
  } catch (err) {
    console.error("Errore nel GET /:", err);
    res.status(500).send('Errore interno');
  }
});

// SSR Routes
app.use('/auth', authRoutes);
app.use('/missions', missioniRoutes);
app.use('/completions', completamentiRoutes);
app.use('/users', usersRoutes);

// Avvio server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
