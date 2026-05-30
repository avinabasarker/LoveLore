/* ============================================ */
/* LoveLore — Utility Functions                 */
/* ============================================ */

// Generate a unique ID (Firebase-compatible)
function generateId() {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return timestamp + '_' + randomPart;
}

// Format a date string nicely
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return d.toLocaleDateString('en-US', options);
}

// Format date with time
function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const options = {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  };
  return d.toLocaleDateString('en-US', options);
}

// Short date for cards
function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const months = ['Jan','Feb','Mar','Apr','May','Jun',
    'Jul','Aug','Sep','Oct','Nov','Dec'];
  return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
}

// Calculate days between two dates
function daysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Countdown from now to a target date
function getCountdown(targetDate) {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const diff = target - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    done: false
  };
}

// ---- Local Storage Helpers ----

function getStoredPin() {
  return localStorage.getItem('lovelore_pin') || null;
}

function setStoredPin(pin) {
  localStorage.setItem('lovelore_pin', pin);
}

function hasPin() {
  return localStorage.getItem('lovelore_pin') !== null;
}

function getActivePartner() {
  return localStorage.getItem('lovelore_partner') || '1';
}

function setActivePartner(partner) {
  localStorage.setItem('lovelore_partner', partner);
}

function getStartDate() {
  return localStorage.getItem('lovelore_start_date') || null;
}

function setStartDate(date) {
  localStorage.setItem('lovelore_start_date', date);
}

// ---- Escape HTML to prevent XSS ----

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

// ---- Throttle helper ----

function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ---- Convert file to base64 ----

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ---- Get today's date as YYYY-MM-DD ----

function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}
