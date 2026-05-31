/* ============================================ */
/* LoveLore — Firebase Configuration            */
/* Media stored in Firestore as encrypted       */
/* base64 (no Storage bucket needed = free)     */
/* ============================================ */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBYzWLaHWmLCwiqBLSBnqOYC0MjHqu2OS8",
  authDomain: "lovelore-f99fb.firebaseapp.com",
  projectId: "lovelore-f99fb",
  storageBucket: "lovelore-f99fb.firebasestorage.app",
  messagingSenderId: "1063866736828",
  appId: "1:1063866736828:web:7f9f0aaa5cc0ff0d5370b9",
  measurementId: "G-WFW9FFEJ23"
};

// ---- Load Firebase SDKs dynamically ----

function loadFirebaseSDK() {
  return new Promise((resolve) => {
    if (window.firebase && firebase.firestore) {
      resolve();
      return;
    }
    const scripts = [
      'https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js',
      'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js',
      'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js'
    ];
    let loaded = 0;
    scripts.forEach((src) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        loaded++;
        if (loaded === scripts.length) {
          initFirebase();
          resolve();
        }
      };
      document.head.appendChild(script);
    });
  });
}

// ---- Initialize Firebase ----

let fdb = null;
let fAuth = null;

function initFirebase() {
  if (!firebase.apps.length) {
    firebase.initializeApp(FIREBASE_CONFIG);
  }
  fdb = firebase.firestore();
  fAuth = firebase.auth();

  // Enable offline persistence (Firebase's own cache)
  fdb.enablePersistence({ synchronizeTabs: true })
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Firestore: multiple tabs open');
      } else if (err.code === 'unimplemented') {
        console.warn('Firestore: persistence not supported');
      }
    });

  console.log('Firebase initialized');
}

// ---- Auth: Anonymous Sign-In ----

async function signInAnonymously() {
  try {
    const result = await fAuth.signInAnonymously();
    console.log('Signed in:', result.user.uid);
    return result.user;
  } catch (e) {
    console.error('Auth failed:', e);
    return null;
  }
}

// ---- Firestore Helpers ----

// Map local store names to Firestore collection names
const COLLECTION_MAP = {
  memories: 'memories',
  characters: 'characters',
  locations: 'locations',
  jokes: 'jokes',
  letters: 'letters',
  capsules: 'capsules',
  firsts: 'firsts',
  fightlog: 'fightlog',
  bucketlist: 'bucketlist',
  settings: 'settings'
};

function getCollection(storeName) {
  return COLLECTION_MAP[storeName] || storeName;
}

async function firestoreSet(storeName, docId, data) {
  if (!fdb) return;
  try {
    const clean = { ...data };
    delete clean._new;
    delete clean._deleted;
    await fdb.collection(getCollection(storeName)).doc(docId).set(clean, { merge: true });
  } catch (e) {
    console.error('Firestore set failed:', e);
  }
}

async function firestoreGetAll(storeName) {
  if (!fdb) return [];
  try {
    const snapshot = await fdb.collection(getCollection(storeName)).get();
    const results = [];
    snapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return results;
  } catch (e) {
    console.error('Firestore getAll failed:', e);
    return [];
  }
}

async function firestoreDelete(storeName, docId) {
  if (!fdb) return;
  try {
    await fdb.collection(getCollection(storeName)).doc(docId).delete();
  } catch (e) {
    console.error('Firestore delete failed:', e);
  }
}

// ---- Compress Image before storing ----
// Firestore docs have 1MB limit.
// We compress to ~800px wide JPEG at 0.6 quality
// which typically gives < 200KB per photo.

function compressImage(file, maxWidth, quality) {
  maxWidth = maxWidth || 800;
  quality = quality || 0.6;
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) {
          h = Math.round((h * maxWidth) / w);
          w = maxWidth;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ---- Load on script load ----

loadFirebaseSDK();
