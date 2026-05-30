/* ============================================ */
/* LoveLore — IndexedDB Local Database Engine   */
/* Offline-first storage + Sync Queue           */
/* ============================================ */

const DB_NAME = 'LoveLoreDB';
const DB_VERSION = 1;

let db = null;

// ---- Initialize Database ----

function openDB() {
  return new Promise((resolve, reject) => {
    if (db) { resolve(db); return; }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Timeline memories
      if (!database.objectStoreNames.contains('memories')) {
        const store = database.createObjectStore('memories', { keyPath: 'id' });
        store.createIndex('date', 'date', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Characters
      if (!database.objectStoreNames.contains('characters')) {
        database.createObjectStore('characters', { keyPath: 'id' });
      }

      // Locations
      if (!database.objectStoreNames.contains('locations')) {
        database.createObjectStore('locations', { keyPath: 'id' });
      }

      // Inside Jokes
      if (!database.objectStoreNames.contains('jokes')) {
        database.createObjectStore('jokes', { keyPath: 'id' });
      }

      // Open When Letters
      if (!database.objectStoreNames.contains('letters')) {
        database.createObjectStore('letters', { keyPath: 'id' });
      }

      // Time Capsules
      if (!database.objectStoreNames.contains('capsules')) {
        database.createObjectStore('capsules', { keyPath: 'id' });
      }

      // Firsts
      if (!database.objectStoreNames.contains('firsts')) {
        database.createObjectStore('firsts', { keyPath: 'id' });
      }

      // Fight Log
      if (!database.objectStoreNames.contains('fightlog')) {
        database.createObjectStore('fightlog', { keyPath: 'id' });
      }

      // Bucket List
      if (!database.objectStoreNames.contains('bucketlist')) {
        database.createObjectStore('bucketlist', { keyPath: 'id' });
      }

      // Sync Queue
      if (!database.objectStoreNames.contains('syncQueue')) {
        const sq = database.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        sq.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject(event.target.error);
    };
  });
}

// ---- Generic CRUD Operations ----

async function dbPut(storeName, data) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.put(data);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function dbGet(storeName, id) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function dbGetAll(storeName) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function dbDelete(storeName, id) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function dbClear(storeName) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ---- Sync Queue Operations ----

async function addToSyncQueue(action, storeName, data) {
  const entry = {
    action: action,     // 'create', 'update', 'delete'
    storeName: storeName,
    data: data,
    timestamp: Date.now()
  };
  await dbPut('syncQueue', entry);
}

async function getSyncQueue() {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('syncQueue', 'readonly');
    const store = tx.objectStore('syncQueue');
    const index = store.index('timestamp');
    const request = index.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function clearSyncQueue() {
  await dbClear('syncQueue');
}

async function removeSyncQueueItem(id) {
  await dbDelete('syncQueue', id);
}

// ---- Convenience: Save + Queue ----

async function saveAndQueue(storeName, data) {
  // Save to IndexedDB
  await dbPut(storeName, data);
  // Add to sync queue for Firebase
  const action = data._deleted ? 'delete' : (data._new ? 'create' : 'update');
  await addToSyncQueue(action, storeName, data);
}

// ---- Get All Sorted ----

async function dbGetAllSorted(storeName, sortField, descending) {
  const items = await dbGetAll(storeName);
  return items.sort((a, b) => {
    const valA = a[sortField] || '';
    const valB = b[sortField] || '';
    if (descending) return valA < valB ? 1 : -1;
    return valA > valB ? 1 : -1;
  });
}

// ---- Count items in a store ----

async function dbCount(storeName) {
  const items = await dbGetAll(storeName);
  return items.length;
}

// ---- Initialize on load ----

openDB().then(() => {
  console.log('LoveLore DB ready');
}).catch((e) => {
  console.error('DB init failed:', e);
});
