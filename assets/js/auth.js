function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach((t, i) => {
    t.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'signup'));
  });
  document.getElementById('panel-login').classList.toggle('active', tab === 'login');
  document.getElementById('panel-signup').classList.toggle('active', tab === 'signup');
  document.getElementById('success-msg').style.display = 'none';
}

function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (type ? ' ' + type + '-toast' : '');
  setTimeout(() => { t.className = 'toast'; }, 3000);
}

/* ---------- TOGGLE PASSWORD ---------- */
function togglePw(id, btn) {
  const input = document.getElementById(id);
  const isText = input.type === 'text';
  input.type = isText ? 'password' : 'text';
  btn.textContent = isText ? '👁' : '🙈';
}

function checkStrength(val) {
  const bars = [1,2,3,4].map(n => document.getElementById('bar' + n));
  const label = document.getElementById('pw-label');
  bars.forEach(b => b.className = 'pw-bar');

  if (!val) { label.textContent = 'Enter a password'; return; }

  let score = 0;
  if (val.length >= 8)  score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  const levels = ['weak','fair','good','strong'];
  const labels = ['Weak','Fair','Good','Strong'];
  const cls    = levels[score - 1] || 'weak';

  for (let i = 0; i < score; i++) bars[i].classList.add(cls);
  label.textContent = 'Strength: ' + (labels[score - 1] || 'Very weak');
}

let termsChecked = false;
function toggleCheckbox() {
  termsChecked = !termsChecked;
  const box = document.getElementById('terms-box');
  box.classList.toggle('checked', termsChecked);
  if (termsChecked) document.getElementById('terms-err').style.display = 'none';
}

function setError(inputId, errId, show) {
  const input = document.getElementById(inputId);
  const err   = document.getElementById(errId);
  input.classList.toggle('error',   show);
  input.classList.toggle('success', !show && input.value.length > 0);
  err.style.display = show ? 'block' : 'none';
  return !show;
}

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function fakeSubmit(btnId, onSuccess) {
  const btn = document.getElementById(btnId);
  btn.classList.add('loading');
  setTimeout(() => {
    btn.classList.remove('loading');
    onSuccess();
  }, 1600);
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const pw    = document.getElementById('login-pw').value;

  const emailOk = setError('login-email', 'login-email-err', !isValidEmail(email));
  const pwOk    = setError('login-pw', 'login-pw-err', pw.length === 0);

  if (!emailOk || !pwOk) return;

  fakeSubmit('login-btn', () => {
    showSuccess('Welcome back!', 'You have logged in successfully. Redirecting to your dashboard...');
  });
}

function handleSignup(e) {
  e.preventDefault();
  const first = document.getElementById('signup-first').value.trim();
  const last  = document.getElementById('signup-last').value.trim();
  const email = document.getElementById('signup-email').value;
  const pw    = document.getElementById('signup-pw').value;

  const firstOk = setError('signup-first', 'signup-first-err', first.length === 0);
  const lastOk  = setError('signup-last',  'signup-last-err',  last.length === 0);
  const emailOk = setError('signup-email', 'signup-email-err', !isValidEmail(email));
  const pwOk    = setError('signup-pw',    'signup-pw-err',    pw.length < 8);

  if (!termsChecked) {
    document.getElementById('terms-err').style.display = 'block';
  }

  if (!firstOk || !lastOk || !emailOk || !pwOk || !termsChecked) return;

  fakeSubmit('signup-btn', () => {
    showSuccess(`Welcome, ${first}!`, 'Your account has been created. Redirecting to your dashboard...');
  });
}

/* ---------- SUCCESS STATE ---------- */
function showSuccess(title, body) {
  document.querySelectorAll('.form-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.auth-tab').forEach(t => t.style.opacity = '0.4');
  const s = document.getElementById('success-msg');
  document.getElementById('success-title').textContent = title;
  document.getElementById('success-body').textContent  = body;
  s.style.display = 'block';
  showToast(title, 'success');
}

/* ---------- FORGOT PASSWORD ---------- */
function showForgot(e) {
  e.preventDefault();
  showToast('Password reset link sent to your email.', 'success');
}

/* ---------- SOCIAL AUTH ---------- */
function socialAuth(provider) {
  showToast(`Connecting with ${provider}...`);
}
