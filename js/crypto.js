/* ============================================ */
/* LoveLore — Client-Side Encryption Engine     */
/* AES-GCM via Web Crypto API                  */
/* Key derived from PIN via PBKDF2             */
/* ============================================ */

const SALT_KEY = 'lovelore_salt';
const ITERATIONS = 100000;
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 12 bytes for AES-GCM

// ---- Salt Management ----

function getOrCreateSalt() {
  let salt = localStorage.getItem(SALT_KEY);
  if (!salt) {
    const saltArray = crypto.getRandomValues(new Uint8Array(16));
    salt = arrayBufferToBase64(saltArray.buffer);
    localStorage.setItem(SALT_KEY, salt);
  }
  return base64ToArrayBuffer(salt);
}

// ---- Key Derivation (PIN -> AES Key) ----

async function deriveKey(pin) {
  const salt = getOrCreateSalt();
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(pin),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

// ---- Encrypt Text ----

async function encryptText(plaintext, pin) {
  if (!plaintext || plaintext.trim() === '') return '';
  try {
    const key = await deriveKey(pin);
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encoder.encode(plaintext)
    );
    // Combine iv + ciphertext into one package
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);
    return arrayBufferToBase64(combined.buffer);
  } catch (e) {
    console.error('Encrypt text failed:', e);
    return plaintext;
  }
}

// ---- Decrypt Text ----

async function decryptText(ciphertext, pin) {
  if (!ciphertext || ciphertext.trim() === '') return '';
  // If it doesn't look like base64, return as-is
  if (!isBase64(ciphertext)) return ciphertext;
  try {
    const key = await deriveKey(pin);
    const combined = base64ToArrayBuffer(ciphertext);
    const iv = combined.slice(0, IV_LENGTH);
    const data = combined.slice(IV_LENGTH);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      data
    );
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (e) {
    console.error('Decrypt text failed:', e);
    return ciphertext;
  }
}

// ---- Encrypt Binary (images, audio, video) ----

async function encryptBinary(base64Data, pin) {
  if (!base64Data) return null;
  try {
    const key = await deriveKey(pin);
    const rawBytes = base64ToArrayBuffer(base64Data);
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      rawBytes
    );
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);
    return arrayBufferToBase64(combined.buffer);
  } catch (e) {
    console.error('Encrypt binary failed:', e);
    return base64Data;
  }
}

// ---- Decrypt Binary (images, audio, video) ----

async function decryptBinary(ciphertext, pin) {
  if (!ciphertext) return null;
  try {
    const key = await deriveKey(pin);
    const combined = base64ToArrayBuffer(ciphertext);
    const iv = combined.slice(0, IV_LENGTH);
    const data = combined.slice(IV_LENGTH);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      data
    );
    return arrayBufferToBase64(decrypted);
  } catch (e) {
    console.error('Decrypt binary failed:', e);
    return ciphertext;
  }
}

// ---- Encrypt a Full Object ----

async function encryptObject(obj, pin) {
  const encrypted = {};
  const stringFields = [
    'title','description','body','bio','role',
    'name','term','definition','originStory',
    'whatHappened','howResolved','lessonLearned',
    'details','history','tags'
  ];
  const binaryFields = [
    'photo','audio','image','coverPhoto',
    'attachment','media'
  ];
  const skipFields = [
    'id','type','createdAt','updatedAt',
    'partner','opened','completed','unlockDate',
    'date','mimeType'
  ];

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      encrypted[key] = value;
    } else if (skipFields.includes(key)) {
      encrypted[key] = value;
    } else if (binaryFields.includes(key) && typeof value === 'string' && value.length > 100) {
      encrypted[key] = await encryptBinary(value, pin);
    } else if (stringFields.includes(key) && typeof value === 'string') {
      encrypted[key] = await encryptText(value, pin);
    } else {
      encrypted[key] = value;
    }
  }
  return encrypted;
}

// ---- Decrypt a Full Object ----

async function decryptObject(obj, pin) {
  const decrypted = {};
  const stringFields = [
    'title','description','body','bio','role',
    'name','term','definition','originStory',
    'whatHappened','howResolved','lessonLearned',
    'details','history','tags'
  ];
  const binaryFields = [
    'photo','audio','image','coverPhoto',
    'attachment','media'
  ];
  const skipFields = [
    'id','type','createdAt','updatedAt',
    'partner','opened','completed','unlockDate',
    'date','mimeType'
  ];

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      decrypted[key] = value;
    } else if (skipFields.includes(key)) {
      decrypted[key] = value;
    } else if (binaryFields.includes(key) && typeof value === 'string' && value.length > 100) {
      decrypted[key] = await decryptBinary(value, pin);
    } else if (stringFields.includes(key) && typeof value === 'string') {
      decrypted[key] = await decryptText(value, pin);
    } else {
      decrypted[key] = value;
    }
  }
  return decrypted;
}

// ---- Helpers ----

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
  if (typeof str !== 'string') return false;
  if (str.length < 4) return false;
  try {
    atob(str);
    return true;
  } catch (e) {
    return false;
  }
}
