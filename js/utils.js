// ==================== LoveLore Utilities ====================

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function generateCoupleCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // No O/0, I/1/L to avoid confusion
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function daysBetween(dateStr, toDate) {
  const d1 = new Date(dateStr);
  const d2 = toDate ? new Date(toDate) : new Date();
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

function getCountdown(targetDate) {
  const now = new Date();
  const target = new Date(targetDate);
  let diff = target - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff -= days * (1000 * 60 * 60 * 24);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  diff -= hours * (1000 * 60 * 60);
  const minutes = Math.floor(diff / (1000 * 60));
  diff -= minutes * (1000 * 60);
  const seconds = Math.floor(diff / 1000);
  return { days, hours, minutes, seconds, done: false };
}

// PIN storage
function getStoredPin() { return localStorage.getItem('ll_pin'); }
function setStoredPin(pin) { localStorage.setItem('ll_pin', pin); }
function hasPin() { return !!localStorage.getItem('ll_pin'); }

// Couple code storage
function getCoupleCode() { return localStorage.getItem('ll_coupleCode'); }
function setCoupleCode(code) { localStorage.setItem('ll_coupleCode', code.toUpperCase()); }
function hasCoupleCode() { return !!localStorage.getItem('ll_coupleCode'); }

// Settings
function getStartDate() { return localStorage.getItem('ll_startDate'); }
function setStartDate(d) { localStorage.setItem('ll_startDate', d); }

// Escape HTML
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// File to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Today as YYYY-MM-DD
function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

// Save a generic setting
function saveSetting(key, value) {
  localStorage.setItem('ll_' + key, value);
  if (key === 'startDate') {
    updateNerdStats();
  }
}
