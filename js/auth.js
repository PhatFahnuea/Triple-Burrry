const USERS_KEY   = 'mock_users';
const SESSION_KEY = 'session';

// =============== Seed Mock Users ===============
(function seed() {
  if (localStorage.getItem(USERS_KEY)) return;
  const users = [
    { id: 1, email: 'admin@shop.com', password: 'admin123', role: 'admin', name: 'Admin',         status: 'Active', orders: 0 },
    { id: 2, email: 'user@shop.com',  password: 'user123',  role: 'user',  name: 'Triple User',  status: 'Active', orders: 0 },
  ];
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
})();

// =============== Storage Helpers ===============
function loadUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
  catch { return []; }
}
function saveUsers(list) {
  localStorage.setItem(USERS_KEY, JSON.stringify(Array.isArray(list) ? list : []));
}

export function getUsers() {
  return loadUsers();
}

export function createUser({ firstName, lastName, email, password, role = 'user' }) {
  const users = loadUsers();
  const emailKey = String(email || '').trim().toLowerCase();
  if (!emailKey || !password) throw new Error('กรุณากรอกอีเมลและรหัสผ่าน');
  const exists = users.some(u => String(u.email).trim().toLowerCase() === emailKey);
  if (exists) throw new Error('อีเมลนี้ถูกใช้แล้ว');

  const id   = (users.at(-1)?.id || 0) + 1;
  const name = [firstName || '', lastName || ''].join(' ').trim() || email;
  const user = {
    id,
    email: emailKey,
    password,
    role: String(role || 'user').toLowerCase(),
    name,
    status: 'Active',
    orders: 0,
  };
  users.push(user);
  saveUsers(users);
  return { id: user.id, email: user.email, role: user.role, name: user.name, status: user.status, orders: user.orders };
}

export function signIn(email, password) {
  const emailKey = String(email || '').trim().toLowerCase();
  const u = loadUsers().find(x => String(x.email).trim().toLowerCase() === emailKey);
  if (!u || u.password !== password) throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
  const session = {
    uid  : u.id,
    email: u.email,
    role : String(u.role || 'user').toLowerCase(),
    name : u.name || u.email,
    ts   : Date.now(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function signOut() {
  try { localStorage.removeItem(SESSION_KEY); } catch {}
}

export function currentUser() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
  catch { return null; }
}

export function isLoggedIn() {
  return !!currentUser();
}

export function hasRole(...roles) {
  const me = currentUser();
  if (!me) return false;
  const wanted = roles.flat().map(r => String(r || '').toLowerCase());
  return wanted.includes(String(me.role || '').toLowerCase());
}

export function requireAuth(redirect = '../auth/signin.html') {
  if (!isLoggedIn()) {
    location.replace(redirect);
  }
}

export function requireRole(roles = [], redirect = '../auth/signin.html') {
  const me = currentUser();
  const wanted = (Array.isArray(roles) ? roles : [roles]).map(r => String(r || '').toLowerCase());
  const ok = !!me && wanted.includes(String(me.role || '').toLowerCase());
  if (!ok) {
    // กันย้อนกลับ
    location.replace(redirect);
  }
}

export function setupNavbar() {
  const me = currentUser();
  const elLogin  = document.querySelector('[data-auth="login"]');
  const elLogout = document.querySelector('[data-auth="logout"]');
  const elAdmin  = document.querySelector('[data-auth="admin"]');
  const elUser   = document.querySelector('[data-auth="user"]');
  const elName   = document.querySelector('[data-auth="name"]');

  if (elName)   elName.textContent = me ? (me.name || me.email) : '';
  if (elLogin)  elLogin.style.display  = me ? 'none' : '';
  if (elLogout) elLogout.style.display = me ? '' : 'none';
  if (elAdmin)  elAdmin.style.display  = (me && String(me.role).toLowerCase() === 'admin') ? '' : 'none';
  if (elUser)   elUser.style.display   = (me && String(me.role).toLowerCase() === 'user')  ? '' : 'none';

  elLogout?.addEventListener('click', (e) => {
    e.preventDefault();
    signOut();
    // กันย้อนกลับ
    location.replace('../auth/signin.html');
  });
}
