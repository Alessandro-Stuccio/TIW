// Helper generale per le chiamate API
export async function fetchAPI(endpoint, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json'
  };

  // Se è FormData (es. upload file), non settiamo Content-Type (lo fa il browser)
  if (options.body instanceof FormData) {
    delete defaultHeaders['Content-Type'];
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    }
  };

  try {
    const response = await fetch(`/api${endpoint}`, config);
    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : null;

    if (!response.ok) {
      throw new Error((data && data.error) || 'Errore di rete');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
}

// Auth API
export async function login(email, password) {
  return fetchAPI('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export async function register(username, email, password) {
  return fetchAPI('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password })
  });
}

export async function logout() {
  return fetchAPI('/auth/logout', { method: 'POST' });
}

export async function getMe() {
  try {
    return await fetchAPI('/auth/me');
  } catch (e) {
    return null;
  }
}

// Utility per gestire la UI dell'header in base all'utente
export async function setupHeader() {
  const user = await getMe();
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  if (user) {
    nav.innerHTML = `
      <li><a href="/index.html">Missioni</a></li>
      <li><a href="/dashboard.html">Il mio profilo</a></li>
      <li><a href="/leaderboard.html">Classifica</a></li>
      ${user.role === 'admin' || user.role === 'moderator' ? '<li><a href="/admin/index.html" class="text-amber">HQ</a></li>' : ''}
      <li><a href="#" id="logout-btn">Logout [${user.username}]</a></li>
    `;

    document.getElementById('logout-btn').addEventListener('click', async (e) => {
      e.preventDefault();
      await logout();
      window.location.href = '/login.html';
    });
  } else {
    nav.innerHTML = `
      <li><a href="/index.html">Missioni</a></li>
      <li><a href="/leaderboard.html">Classifica</a></li>
      <li><a href="/login.html">Login</a></li>
      <li><a href="/register.html" class="btn btn-primary" style="padding: 5px 10px;">Registrati</a></li>
    `;
  }
  return user;
}

// Utility per mostrare messaggi
export function showAlert(containerId, message, type = 'error') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;

  setTimeout(() => {
    container.innerHTML = '';
  }, 5000);
}
