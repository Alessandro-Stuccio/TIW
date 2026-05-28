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
  tbody.innerHTML = data.map((user, i) => `
    <tr>
      <td style="padding:10px;">#${i + 1}</td>
      <td style="padding:10px;">${user.username}</td>
      <td style="padding:10px; color:var(--accent-amber); font-weight:bold;">${user.points} PT</td>
    </tr>
  `).join('');
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
