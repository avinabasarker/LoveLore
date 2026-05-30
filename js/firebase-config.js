/* ============================================ */
/* LoveLore — Firebase Configuration            */
/* ============================================ */

// Firebase SDK (loaded via CDN in this file)
// We use Firestore for structured data and
// Firebase Storage for media files.

const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
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
      'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js',
      'https://www.gstatic.com/firebasejs/10.12.0/firebase-storage-compat.js'
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

let db = null;
let storage = null;
let auth = null;

function initFirebase() {
  if (!firebase.apps.length) {
    firebase.initializeApp(FIREBASE_CONFIG);
  }
  db = firebase.firestore();
  auth = firebase.auth();
  storage = firebase.storage();

  // Enable offline persistence
  db.enablePersistence({ synchronizeTabs: true })
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Firestore persistence: multiple tabs open');
      } else if (err.code === 'unimplemented') {
        console.warn('Firestore persistence: browser not supported');
      }
    });

  console.log('Firebase initialized');
}

// ---- Auth: Anonymous Sign-In ----

async function signInAnonymously() {
  try {
    const result = await auth.signInAnonymously();
    console.log('Signed in:', result.user.uid);
    return result.user;
  } catch (e) {
    console.error('Auth failed:', e);
    return null;
  }
}

// ---- Firestore Helpers ----

async function firestoreSet(collection, docId, data) {
  if (!db) return;
  try {
    await db.collection(collection).doc(docId).set(data, { merge: true });
  } catch (e) {
    console.error('Firestore set failed:', e);
  }
}

async function firestoreGet(collection, docId) {
  if (!db) return null;
  try {
    const doc = await db.collection(collection).doc(docId).get();
    return doc.exists ? doc.data() : null;
  } catch (e) {
    console.error('Firestore get failed:', e);
    return null;
  }
}

async function firestoreGetAll(collection) {
  if (!db) return [];
  try {
    const snapshot = await db.collection(collection).get();
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

async function firestoreDelete(collection, docId) {
  if (!db) return;
  try {
    await db.collection(collection).doc(docId).delete();
  } catch (e) {
    console.error('Firestore delete failed:', e);
  }
}

// ---- Storage Helpers ----

async function storageUpload(path, data) {
  if (!storage) return null;
  try {
    const ref = storage.ref().child(path);
    await ref.putString(data, 'data_url');
    return await ref.getDownloadURL();
  } catch (e) {
    console.error('Storage upload failed:', e);
    return null;
  }
}

async function storageDownload(path) {
  if (!storage) return null;
  try {
    const ref = storage.ref().child(path);
    return await ref.getDownloadURL();
  } catch (e) {
    console.error('Storage download failed:', e);
    return null;
  }
}

// ---- Load on script load ----

loadFirebaseSDK();
