// Punto di ingresso principale dell'applicazione.
// Qui configuriamo Express, il server HTTP, Socket.io per il real-time e tutte le rotte.
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
import adminRoutes from './routes/admin.js';

const app = express();
const httpServer = createServer(app);

// Configurazione del motore di template (Handlebars).
// Utilizziamo Handlebars per il Server-Side Rendering (SSR).
// Abbiamo definito un helper personalizzato `eq` per fare confronti diretti nei template (es. per verificare i ruoli).
app.engine('hbs', engine({ 
  extname: '.hbs', 
  defaultLayout: 'main',
  partialsDir: path.join(__dirname, '../views/partials'),
  helpers: {
    eq: (a, b) => a === b,
    inc: (n) => n + 1
  }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../views'));

// Configurazione di Socket.io per le funzionalità in tempo reale (es. aggiornamento classifica).
// Lo leghiamo al server HTTP nativo. Niente CORS: i client sono serviti dalla stessa origine.
const io = new Server(httpServer);
// Salviamo l'istanza di 'io' nell'app Express così da poterla usare all'interno delle rotte (es. dopo l'approvazione di una prova).
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

// Gestione delle sessioni persistenti.
// Usiamo SQLite come store per le sessioni in modo che i login non vadano persi al riavvio del server.
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
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 settimana
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// Middleware globale: rende i dati dell'utente loggato sempre disponibili in ogni template Handlebars.
// Se l'utente è in sessione, passiamo le sue info di base (id, ruolo, username) a 'res.locals.user'.
app.use((req, res, next) => {
  res.locals.user = req.session.userId ? { 
    id: req.session.userId, 
    role: req.session.role, 
    username: req.session.username 
  } : null;
  next();
});

// Rotta Home Page: Carica la lista delle missioni attive.
// Supporta anche il filtraggio tramite query string (categoria e difficoltà).
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

// Registrazione di tutti i moduli di routing.
// Ogni modulo gestisce un prefisso specifico dell'URL.
app.use('/auth', authRoutes);
app.use('/missions', missioniRoutes);
app.use('/completions', completamentiRoutes);
app.use('/users', usersRoutes);
app.use('/admin', adminRoutes);

// Middleware per il 404
app.use((req, res) => {
  res.status(404).render('errors/404');
});

// Middleware globale per il 500
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('errors/500', { message: 'Errore interno del server' });
});

// Avvio server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
