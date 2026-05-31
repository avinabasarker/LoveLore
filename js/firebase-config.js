// ==================== LoveLore Firebase Config ====================

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBYzWLaHWmLCwiqBLSBnqOYC0MjHqu2OS8",
  authDomain: "lovelore-f99fb.firebaseapp.com",
  projectId: "lovelore-f99fb",
  storageBucket: "lovelore-f99fb.firebasestorage.app",
  messagingSenderId: "1063866736828",
  appId: "1:1063866736828:web:7f9f0aaa5cc0ff0d5370b9",
  measurementId: "G-WFW9FFEJ23"
};

let firebaseApp = null;
let firestoreDB = null;
let firebaseUser = null;

// Get Firestore collection name with couple code prefix
function getCollectionName(storeName) {
  const code = getCoupleCode();
  if (!code) return storeName;
  return code.toLowerCase() + '_' + storeName;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function initFirebase() {
  try {
    await loadScript('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
    await loadScript('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js');
    await loadScript('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js');

    firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
    firestoreDB = firebase.firestore();

    try {
      await firestoreDB.enablePersistence({ synchronizeTabs: true });
    } catch (e) {
      console.warn('Firestore persistence failed:', e.message);
    }

    return true;
  } catch (e) {
    console.error('Firebase init error:', e);
    return false;
  }
}

async function signInAnonymously() {
  try {
    if (!firebaseApp) return false;
    const auth = firebase.auth();
    const result = await auth.signInAnonymously();
    firebaseUser = result.user;
    return true;
  } catch (e) {
    console.error('Auth error:', e);
    return false;
  }
}

async function firestoreSet(collectionName, docId, data) {
  try {
    if (!firestoreDB) return false;
    await firestoreDB.collection(collectionName).doc(docId).set(data);
    return true;
  } catch (e) {
    console.error('Firestore set error:', e);
    return false;
  }
}

async function firestoreGetAll(collectionName) {
  try {
    if (!firestoreDB) return [];
    const snap = await firestoreDB.collection(collectionName).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('Firestore get error:', e);
    return [];
  }
}

async function firestoreDelete(collectionName, docId) {
  try {
    if (!firestoreDB) return false;
    await firestoreDB.collection(collectionName).doc(docId).delete();
    return true;
  } catch (e) {
    console.error('Firestore delete error:', e);
    return false;
  }
}

// Save couple config (salt) to Firestore
async function saveCoupleConfig(code, salt) {
  try {
    if (!firestoreDB) return false;
    await firestoreDB.collection('config').doc(code.toLowerCase()).set({
      salt: salt,
      createdAt: Date.now()
    });
    return true;
  } catch (e) {
    console.error('Save couple config error:', e);
    return false;
  }
}

// Load couple config (salt) from Firestore
async function loadCoupleConfig(code) {
  try {
    if (!firestoreDB) return null;
    const doc = await firestoreDB.collection('config').doc(code.toLowerCase()).get();
    if (doc.exists) {
      return doc.data();
    }
    return null;
  } catch (e) {
    console.error('Load couple config error:', e);
    return null;
  }
}

// Image compression before storage
function compressImage(file, maxWidth, quality) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.onload = () => {
      let w = img.width;
      let h = img.height;
      if (w > maxWidth) {
        h = Math.round(h * maxWidth / w);
        w = maxWidth;
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/jpeg', quality || 0.6);
      resolve(dataUrl);
    };
    img.onerror = () => resolve(null);
    img.src = URL.createObjectURL(file);
  });
}
