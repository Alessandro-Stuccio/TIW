// Modulo di utility per la validazione dei dati delle missioni.
// Disaccoppia la logica di controllo dalle rotte (admin.js) rendendola riutilizzabile.
export const validateMissionInput = (body) => {
  const { title, description, location, lat, lng, points, difficulty, category, status } = body;
  const errors = [];

  // Controlli di base sui campi di testo
  if (!title || title.trim().length < 3)
    errors.push('Il titolo deve avere almeno 3 caratteri.');
  if (!description || description.trim().length < 10)
    errors.push('La descrizione deve avere almeno 10 caratteri.');
  if (!location || location.trim().length < 2)
    errors.push('Il luogo è obbligatorio.');
  const pts = parseInt(points, 10);
  if (isNaN(pts) || pts <= 0)
    errors.push('I punti devono essere un numero positivo.');
  // Validazione opzionale di coordinate spaziali per il corretto funzionamento su mappa
  if (lat && (isNaN(parseFloat(lat)) || parseFloat(lat) < -90 || parseFloat(lat) > 90))
    errors.push('Latitudine non valida (deve essere tra -90 e 90).');
  if (lng && (isNaN(parseFloat(lng)) || parseFloat(lng) < -180 || parseFloat(lng) > 180))
    errors.push('Longitudine non valida (deve essere tra -180 e 180).');

  // Controllo validità su set predefiniti
  const validDifficulties = ['facile', 'medio', 'difficile'];
  if (!validDifficulties.includes(difficulty))
    errors.push('Difficoltà non valida.');

  const validCategories = ['esplorazione', 'cultura', 'fotografia', 'utilità', 'assurdità controllata'];
  if (!validCategories.includes(category))
    errors.push('Categoria non valida.');

  // Lo status è presente solo nel form di modifica; se inviato deve essere uno dei valori previsti
  const validStatuses = ['attiva', 'archiviata'];
  if (status !== undefined && !validStatuses.includes(status))
    errors.push('Stato non valido.');

  // Restituisce un oggetto con l'array degli eventuali errori (da mostrare all'utente) e i dati originari processati
  return { errors, data: body };
};
