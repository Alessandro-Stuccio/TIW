import { fetchAPI, setupHeader } from './api.js';

let currentUserId = null;

document.addEventListener('DOMContentLoaded', async () => {
  const user = await setupHeader();
  if (user) {
    currentUserId = user.id;
  }

  await loadLeaderboard();
  setupSocket();
});

async function loadLeaderboard() {
  try {
    const data = await fetchAPI('/users/leaderboard');
    renderLeaderboard(data);
  } catch (err) {
    document.getElementById('leaderboard-body').innerHTML = `
      <tr><td colspan="3" class="text-center text-red">Errore nel caricamento della classifica.</td></tr>
    `;
  }
}

function renderLeaderboard(data) {
  const tbody = document.getElementById('leaderboard-body');

  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">Nessun agente registrato.</td></tr>';
    return;
  }

  tbody.innerHTML = data.map((user, index) => {
    const isMe = currentUserId === user.id;
    const highlightClass = isMe ? 'style="background: rgba(0, 255, 136, 0.1);"' : '';
    let posStr = `0${index + 1}`.slice(-2);

    return `
      <tr ${highlightClass}>
        <td>${posStr}</td>
        <td>
          ${user.username}
          ${isMe ? '<span class="tag tag-facile" style="margin-left: 10px;">Tu</span>' : ''}
        </td>
        <td style="text-align: right; font-family: var(--font-display);">${user.points} PT</td>
      </tr>
    `;
  }).join('');
}

function setupSocket() {
  const socket = io();

  socket.on('leaderboard_update', (data) => {
    // Mostra indicatore di aggiornamento
    const ind = document.getElementById('update-indicator');
    ind.style.display = 'block';
    setTimeout(() => { ind.style.display = 'none'; }, 3000);

    // Ricarica dati
    loadLeaderboard();
  });
}
