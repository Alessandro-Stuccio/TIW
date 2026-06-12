// Middleware per l'upload e il salvataggio fisico dei file (in particolare le foto di prova).
// Utilizza la libreria 'multer' per parsare i form 'multipart/form-data'.
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurazione dello storage:
// Salviamo le immagini localmente nella cartella 'uploads/proofs/'.
// Viene generato un nome univoco (timestamp + suffix casuale) per prevenire collisioni e attacchi di sovrascrittura.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/proofs/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro di sicurezza: 
// Accettiamo esclusivamente file il cui MIME type inizia per 'image/'.
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo le immagini sono permesse!'), false);
  }
};

// Esporta il middleware preconfigurato, limitando la dimensione del file a 5MB per evitare sovraccarichi sul server.
export const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
