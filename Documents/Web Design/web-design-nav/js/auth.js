// /JS/auth.js
const USERS_KEY = 'mock_users';
const SESSION_KEY = 'session';

// seed mock
(function seed() {
  if (localStorage.getItem(USERS_KEY)) return;
  const users = [
    { id: 1, email: 'admin@shop.com', password: 'admin123', role: 'admin', name: 'Admin' },
    { id: 2, email: 'user@shop.com',  password: 'user123',  role: 'user',  name: 'Triple User' },
  ];
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
})();

function loadUsers() { try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch { return []; } }
function saveUsers(list) { localStorage.setItem(USERS_KEY, JSON.stringify(list)); }

export function createUser({ firstName, lastName, email, password, role = 'user' }) {
  const users = loadUsers();
  const exists = users.some(u => u.email.trim().toLowerCase() === email.trim().toLowerCase());
  if (exists) throw new Error('อีเมลนี้ถูกใช้แล้ว');

  const id = (users.at(-1)?.id || 0) + 1;
  const name = [firstName || '', lastName || ''].join(' ').trim() || email;
  users.push({ id, email, password, role, name });
  saveUsers(users);
  return { id, email, role, name };
}

export function signIn(email, password) {
  const u = loadUsers().find(x => x.email.trim().toLowerCase() === String(email).trim().toLowerCase());
  if (!u || u.password !== password) throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
  const session = { uid: u.id, email: u.email, role: u.role, name: u.name, ts: Date.now() };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function signOut() { localStorage.removeItem(SESSION_KEY); }
export function currentUser() { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; } }
export function isLoggedIn() { return !!currentUser(); }
export function hasRole(...roles) { const me = currentUser(); return !!me && roles.includes(me.role); }

// ใช้พาธตัวเล็ก ตามโปรเจ็กต์พี่: ../auth/signin.html
export function requireAuth(redirect = '../auth/signin.html') {
  if (!isLoggedIn()) location.href = redirect;
}
export function requireRole(roles = [], redirect = '../home.html') {
  const me = currentUser();
  if (!me || !roles.includes(me.role)) location.href = redirect;
}

export function setupNavbar() {
  const me = currentUser();
  const elLogin  = document.querySelector('[data-auth="login"]');
  const elLogout = document.querySelector('[data-auth="logout"]');
  const elAdmin  = document.querySelector('[data-auth="admin"]');
  const elUser   = document.querySelector('[data-auth="user"]');
  const elName   = document.querySelector('[data-auth="name"]');

  if (elName)  elName.textContent = me ? me.name : '';
  if (elLogin) elLogin.style.display  = me ? 'none' : '';
  if (elLogout)elLogout.style.display = me ? '' : 'none';
  if (elAdmin) elAdmin.style.display  = (me && me.role === 'admin') ? '' : 'none';
  if (elUser)  elUser.style.display   = (me && me.role === 'user')  ? '' : 'none';

  // Logout ผ่าน navbar (ถ้ามีปุ่ม data-auth="logout")
  elLogout?.addEventListener('click', (e) => {
    e.preventDefault();
    signOut();
    location.href = '../auth/signin.html';
  });
}
