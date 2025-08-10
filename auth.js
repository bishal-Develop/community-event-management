// simple frontend-only auth with localStorage
const USERS_KEY = "users";
const SESSION_KEY = "session";

const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY)) || [];

const saveUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

const setSession = (session) => localStorage.setItem(SESSION_KEY, JSON.stringify(session));

const getSession = () => JSON.parse(localStorage.getItem(SESSION_KEY));

const clearSession = () => localStorage.removeItem(SESSION_KEY);

const logout = () => {
  clearSession();
  window.location.href = "login.html";
};

// Utility: Hash a string using SHA-256 and return hex string
const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

// ----- Sign Up -----
const signUp = async (e) => {
  e.preventDefault();

  const form = e.target;
  const name = form.name.value.trim();
  const email = form.email.value.trim().toLowerCase();
  const password = form.password.value;
  const hashedPassword = await hashPassword(password);

  const users = getUsers();
  users.push({ name, email, password: hashedPassword });
  saveUsers(users);

  window.location.href = "login.html";
};

// ----- Login -----
const login = async (e) => {
  e.preventDefault();

  const form = e.target;
  const email = form.email.value.trim().toLowerCase();
  const password = form.password.value;

  // Hash the entered password to compare
  const hashedPassword = await hashPassword(password);

  const users = getUsers();
  const user = users.find(
    (u) => u.email === email && u.password === hashedPassword
  );

  if (!user) {
    alert("Invalid email or password");
    return;
  }

  setSession({ email: user.email, name: user.name });
  window.location.href = "index.html";
};

// ----- Guard -----
const requireAuth = () => {
  const session = getSession();
  if (!session) {
    window.location.href = "login.html";
    return;
  }
  const welcome = document.getElementById("welcomeName");
  if (welcome) welcome.textContent = session.name || session.email;
};