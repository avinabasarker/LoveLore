// ==================== LoveLore Encryption Engine ====================
// AES-GCM via Web Crypto API, PBKDF2 key derivation from PIN

const SALT_KEY = 'll_crypto_salt';
const ITERATIONS = 100000;

function getOrCreateSalt() {
  let salt = localStorage.getItem(SALT_KEY);
  if (!salt) {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    salt = arrayBufferToBase64(arr.buffer);
    localStorage.setItem(SALT_KEY, salt);
  }
  return base64ToArrayBuffer(salt);
}

// Get salt as base64 string (for sharing to Firestore)
function getSaltBase64() {
  return localStorage.getItem(SALT_KEY);
}

// Set salt from external source (when joining a couple)
function setExternalSalt(base64Salt) {
  localStorage.setItem(SALT_KEY, base64Salt);
}

async function deriveKey(pin) {
  const salt = getOrCreateSalt();
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(pin), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptText(plaintext, key) {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key, enc.encode(plaintext)
  );
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return arrayBufferToBase64(combined.buffer);
}

async function decryptText(ciphertextB64, key) {
  const data = new Uint8Array(base64ToArrayBuffer(ciphertextB64));
  const iv = data.slice(0, 12);
  const ciphertext = data.slice(12);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv }, key, ciphertext
  );
  return new TextDecoder().decode(decrypted);
}

async function encryptBinary(base64Data, key) {
  const binary = base64ToArrayBuffer(base64Data);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, key, binary
  );
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return arrayBufferToBase64(combined.buffer);
}

async function decryptBinary(encryptedB64, key) {
  const data = new Uint8Array(base64ToArrayBuffer(encryptedB64));
  const iv = data.slice(0, 12);
  const ciphertext = data.slice(12);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv }, key, ciphertext
  );
  return arrayBufferToBase64(decrypted);
}

// Encrypt specific fields of an object
const STRING_FIELDS = ['title', 'text', 'description', 'condition', 'message', 'name'];
const BINARY_FIELDS = ['image', 'audio', 'video'];
const SKIP_FIELDS = ['id', 'type', 'createdAt', 'updatedAt', 'opened', 'done', 'openDate', 'date', 'partner'];

async function encryptObject(obj, key) {
  const encrypted = { ...obj };
  for (const field of STRING_FIELDS) {
    if (obj[field] && typeof obj[field] === 'string' && obj[field].length > 0) {
      encrypted[field] = await encryptText(obj[field], key);
    }
  }
  for (const field of BINARY_FIELDS) {
    if (obj[field] && typeof obj[field] === 'string' && isBase64(obj[field]) && obj[field].length > 100) {
      encrypted[field] = await encryptBinary(obj[field], key);
    }
  }
  return encrypted;
}

async function decryptObject(obj, key) {
  const decrypted = { ...obj };
  for (const field of STRING_FIELDS) {
    if (obj[field] && typeof obj[field] === 'string' && !SKIP_FIELDS.includes(field)) {
      try {
        decrypted[field] = await decryptText(obj[field], key);
      } catch (e) { /* not encrypted or wrong key */ }
    }
  }
  for (const field of BINARY_FIELDS) {
    if (obj[field] && typeof obj[field] === 'string' && isBase64(obj[field])) {
      try {
        decrypted[field] = await decryptBinary(obj[field], key);
      } catch (e) { /* not encrypted or wrong key */ }
    }
  }
  return decrypted;
}

// Helpers
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function isBase64(str) {
  if (!str || str.length < 4) return false;
  try {
    const decoded = atob(str.substring(0, 100));
    return decoded.length > 0;
  } catch (e) {
    return false;
  }
}
