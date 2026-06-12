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
// Il MIME type è dichiarato dal client e non è affidabile da solo: controlliamo
// anche l'estensione del file originale (che viene riusata per il salvataggio),
// altrimenti un file .html spacciato per immagine verrebbe servito come HTML da /uploads.
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (file.mimetype.startsWith('image/') && ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Solo le immagini sono permesse (jpg, jpeg, png, gif, webp)!'), false);
  }
};

// Esporta il middleware preconfigurato, limitando la dimensione del file a 5MB per evitare sovraccarichi sul server.
export const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
