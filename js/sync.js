/* ============================================ */
/* LoveLore — Offline-First Sync Engine         */
/* IndexedDB ↔ Firestore bridge                */
/* ============================================ */

let syncInterval = null;
let isSyncing = false;
const SYNC_INTERVAL_MS = 15000; // Check every 15 seconds

// ---- Start the Sync Engine ----

function startSyncEngine() {
  console.log('Sync engine started');
  syncInterval = setInterval(async () => {
    if (navigator.onLine && !isSyncing) {
      await performSync();
    }
  }, SYNC_INTERVAL_MS);

  // Also listen for online/offline events
  window.addEventListener('online', async () => {
    updateSyncIndicator('syncing');
    await performSync();
  });

  window.addEventListener('offline', () => {
    updateSyncIndicator('offline');
  });

  // Initial sync indicator
  updateSyncIndicator(navigator.onLine ? 'synced' : 'offline');

  // Do an initial sync if online
  if (navigator.onLine) {
    performSync();
  }
}

// ---- Stop the Sync Engine ----

function stopSyncEngine() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}

// ---- Main Sync Function ----

async function performSync() {
  if (isSyncing) return;
  isSyncing = true;
  updateSyncIndicator('syncing');

  try {
    // Step 1: Sign in to Firebase if not already
    if (!fAuth || !fAuth.currentUser) {
      await signInAnonymously();
    }

    // Step 2: Process the local sync queue
    await pushLocalChanges();

    // Step 3: Pull remote changes from Firebase
    await pullRemoteChanges();

    // Step 4: Update UI with fresh data
    if (typeof refreshCurrentScreen === 'function') {
      refreshCurrentScreen();
    }

    updateSyncIndicator('synced');
  } catch (e) {
    console.error('Sync failed:', e);
    updateSyncIndicator('error');
  } finally {
    isSyncing = false;
  }
}

// ---- Push Local Changes to Firebase ----

async function pushLocalChanges() {
  const queue = await getSyncQueue();
  if (queue.length === 0) return;

  console.log('Pushing', queue.length, 'local changes');

  for (const item of queue) {
    try {
      const storeName = item.storeName;
      const data = item.data;
      const action = item.action;

      if (action === 'delete') {
        await firestoreDelete(storeName, data.id);
      } else {
        // Encrypt before sending to Firebase
        const pin = getStoredPin();
        let encrypted = data;
        if (pin && typeof encryptObject === 'function') {
          encrypted = await encryptObject(data, pin);
        }
        // Use couple code prefixed collection
        await firestoreSet(storeName, data.id, encrypted);
      }

      // Remove this item from the queue after success
      await removeSyncQueueItem(item.id);

    } catch (e) {
      console.error('Failed to push item:', item, e);
      // Skip this item and try the next one
      // It will retry on next sync cycle
    }
  }
}

// ---- Pull Remote Changes from Firebase ----

async function pullRemoteChanges() {
  const collections = [
    'memories', 'characters', 'locations', 'jokes',
    'letters', 'capsules', 'firsts', 'fightlog', 'bucketlist'
  ];

  const pin = getStoredPin();

  for (const storeName of collections) {
    try {
      // Get all remote docs from this collection
      const remoteItems = await firestoreGetAll(storeName);

      // Get all local docs from IndexedDB
      const localItems = await dbGetAll(storeName);

      // Build a map of local items by ID for quick lookup
      const localMap = {};
      localItems.forEach((item) => {
        localMap[item.id] = item;
      });

      // Process each remote item
      for (const remoteItem of remoteItems) {
        const remoteId = remoteItem.id;
        const localItem = localMap[remoteId];

        if (!localItem) {
          // NEW from partner — doesn't exist locally
          // Decrypt before saving to IndexedDB
          let decrypted = remoteItem;
          if (pin && typeof decryptObject === 'function') {
            try {
              decrypted = await decryptObject(remoteItem, pin);
            } catch (e) {
              console.warn('Decrypt failed for', remoteId, e);
            }
          }
          await dbPut(storeName, decrypted);

        } else {
          // EXISTS locally — check timestamps
          const localTime = localItem.updatedAt || localItem.createdAt || 0;
          const remoteTime = remoteItem.updatedAt || remoteItem.createdAt || 0;

          if (remoteTime > localTime) {
            // Remote is newer — update local
            let decrypted = remoteItem;
            if (pin && typeof decryptObject === 'function') {
              try {
                decrypted = await decryptObject(remoteItem, pin);
              } catch (e) {
                console.warn('Decrypt failed for', remoteId, e);
              }
            }
            await dbPut(storeName, decrypted);

          }
          // If local is newer or same, we keep local
          // The next push will update Firebase
        }
      }

      // Check for locally deleted items
      // Items that exist locally but not remotely and
      // are NOT in the sync queue were deleted by partner
      const remoteIds = new Set(remoteItems.map(i => i.id));
      const queue = await getSyncQueue();
      const queuedIds = new Set(queue.map(q => q.data && q.data.id));

      for (const localItem of localItems) {
        if (!remoteIds.has(localItem.id) && !queuedIds.has(localItem.id)) {
          // Local item not on remote and not queued
          // Could have been deleted by partner
          // We DON'T auto-delete locally — safer to keep
        }
      }

    } catch (e) {
      console.error('Pull failed for', storeName, e);
    }
  }
}

// ---- Sync Indicator UI ----

function updateSyncIndicator(status) {
  const dot = document.getElementById('syncIndicator');
  if (!dot) return;

  switch (status) {
    case 'synced':
      dot.style.background = '#A3C48B';
      dot.style.boxShadow = '0 0 6px rgba(163,196,139,0.5)';
      dot.title = 'Synced';
      break;
    case 'syncing':
      dot.style.background = '#FFCCD5';
      dot.style.boxShadow = '0 0 6px rgba(255,204,213,0.5)';
      dot.title = 'Syncing...';
      break;
    case 'offline':
      dot.style.background = '#E8E0D8';
      dot.style.boxShadow = 'none';
      dot.title = 'Offline';
      break;
    case 'error':
      dot.style.background = '#FF4D6D';
      dot.style.boxShadow = '0 0 6px rgba(255,77,109,0.5)';
      dot.title = 'Sync error';
      break;
  }
}

// ---- Force a manual sync ----

async function forceSync() {
  if (!navigator.onLine) {
    updateSyncIndicator('offline');
    return;
  }
  await performSync();
}

// ---- Initial sync after joining a couple ----

async function initialSync() {
  updateSyncIndicator('syncing');
  await performSync();
}
