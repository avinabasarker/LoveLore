// ==================== LoveLore IndexedDB Engine ====================

const DB_NAME = 'LoveLoreDB';
const DB_VERSION = 2;
let dbInstance = null;

const STORE_NAMES = [
  'memories', 'characters', 'locations', 'jokes',
  'letters', 'capsules', 'firsts', 'fightlog',
  'bucketlist', 'syncQueue'
];

function openDB() {
  return new Promise((resolve, reject) => {
    if (dbInstance) return resolve(dbInstance);
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      for (const name of STORE_NAMES) {
        if (!db.objectStoreNames.contains(name)) {
          const store = db.createObjectStore(name, { keyPath: 'id' });
          if (name === 'syncQueue') {
            store.createIndex('timestamp', 'timestamp', { unique: false });
          }
          if (name === 'memories') {
            store.createIndex('date', 'date', { unique: false });
            store.createIndex('createdAt', 'createdAt', { unique: false });
          }
        }
      }
    };
    req.onsuccess = (e) => {
      dbInstance = e.target.result;
      resolve(dbInstance);
    };
    req.onerror = (e) => reject(e.target.error);
  });
}

async function dbPut(storeName, data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(data);
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(e.target.error);
  });
}

async function dbGet(storeName, id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

async function dbGetAll(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = (e) => reject(e.target.error);
  });
}

async function dbDelete(storeName, id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(e.target.error);
  });
}

async function dbClear(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(e.target.error);
  });
}

async function dbGetAllSorted(storeName, indexName, direction) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const index = indexName ? store.index(indexName) : store;
    const req = index.getAll();
    req.onsuccess = () => {
      let results = req.result || [];
      if (direction === 'desc') results.reverse();
      resolve(results);
    };
    req.onerror = (e) => reject(e.target.error);
  });
}

async function dbCount(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

// Sync Queue Operations
async function addToSyncQueue(storeName, docId, action) {
  const entry = {
    id: generateId(),
    storeName,
    docId,
    action: action || 'put',
    timestamp: Date.now()
  };
  await dbPut('syncQueue', entry);
}

async function getSyncQueue() {
  return dbGetAllSorted('syncQueue', 'timestamp', 'asc');
}

async function clearSyncQueue() {
  return dbClear('syncQueue');
}

async function removeSyncQueueItem(id) {
  return dbDelete('syncQueue', id);
}

// Combined save + queue
async function saveAndQueue(storeName, data) {
  data.updatedAt = Date.now();
  if (!data.createdAt) data.createdAt = Date.now();
  await dbPut(storeName, data);
  await addToSyncQueue(storeName, data.id, 'put');
}
