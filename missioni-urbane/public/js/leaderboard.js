document.addEventListener('DOMContentLoaded', () => {
  loadLeaderboard();
  setupSocket();
});

async function loadLeaderboard() {
  try {
    const res = await fetch('/users/leaderboard/data');
    if (!res.ok) throw new Error('Errore fetch');
    const data = await res.json();
    renderLeaderboard(data);
  } catch (err) {
    const tbody = document.getElementById('leaderboard-body');
    if (tbody) tbody.innerHTML =
      '<tr><td colspan="3" class="text-center">Errore nel caricamento.</td></tr>';
  }
}

function renderLeaderboard(data) {
  const tbody = document.getElementById('leaderboard-body');
  if (!tbody) return;
  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">Nessun agente.</td></tr>';
    return;
  }
  // Costruiamo le righe via DOM e textContent: lo username è input utente
  // e non deve mai essere interpretato come HTML.
  tbody.innerHTML = '';
  data.forEach((user, i) => {
    const tr = document.createElement('tr');
    const cells = [`#${i + 1}`, user.username, `${user.points} PT`];
    cells.forEach((text, col) => {
      const td = document.createElement('td');
      td.style.padding = '10px';
      if (col === 2) {
        td.style.color = 'var(--accent-amber)';
        td.style.fontWeight = 'bold';
      }
      td.textContent = text;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function setupSocket() {
  if (typeof io === 'undefined') return;
  const socket = io();
  socket.on('leaderboard_update', () => {
    const ind = document.getElementById('update-indicator');
    if (ind) { ind.style.display = 'block'; setTimeout(() => ind.style.display = 'none', 3000); }
    loadLeaderboard();
  });
}
