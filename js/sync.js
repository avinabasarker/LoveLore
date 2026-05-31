// ==================== LoveLore Sync Engine ====================

let syncInterval = null;

function startSyncEngine() {
  // Clear any existing interval
  if (syncInterval) clearInterval(syncInterval);

  // Sync every 15 seconds
  syncInterval = setInterval(performSync, 15000);

  // Also sync on online event
  window.addEventListener('online', () => {
    updateSyncIndicator('syncing');
    performSync();
  });
  window.addEventListener('offline', () => {
    updateSyncIndicator('offline');
  });
}

async function performSync() {
  // Don't sync if no couple code or not online
  if (!hasCoupleCode()) {
    updateSyncIndicator('offline');
    return;
  }

  if (!navigator.onLine) {
    updateSyncIndicator('offline');
    return;
  }

  try {
    updateSyncIndicator('syncing');

    // Sign in if needed
    if (!firebaseUser) {
      const ok = await signInAnonymously();
      if (!ok) {
        updateSyncIndicator('error');
        return;
      }
    }

    // Push local changes
    await pushLocalChanges();

    // Pull remote changes
    await pullRemoteChanges();

    // Refresh UI
    refreshCurrentScreen();
    updateNerdStats();

    updateSyncIndicator('online');
  } catch (e) {
    console.error('Sync error:', e);
    updateSyncIndicator('error');
  }
}

async function pushLocalChanges() {
  const queue = await getSyncQueue();
  if (queue.length === 0) return;

  const pin = getStoredPin();
  if (!pin) return;

  try {
    const key = await deriveKey(pin);

    for (const item of queue) {
      const collectionName = getCollectionName(item.storeName);

      if (item.action === 'delete') {
        await firestoreDelete(collectionName, item.docId);
      } else {
        // Get the local doc
        const doc = await dbGet(item.storeName, item.docId);
        if (!doc) {
          await removeSyncQueueItem(item.id);
          continue;
        }
        // Encrypt before sending
        const encrypted = await encryptObject(doc, key);
        await firestoreSet(collectionName, item.docId, encrypted);
      }

      await removeSyncQueueItem(item.id);
    }
  } catch (e) {
    console.error('Push error:', e);
  }
}

async function pullRemoteChanges() {
  const pin = getStoredPin();
  if (!pin) return;

  try {
    const key = await deriveKey(pin);

    for (const storeName of STORE_NAMES) {
      const collectionName = getCollectionName(storeName);
      const remoteDocs = await firestoreGetAll(collectionName);

      for (const remoteDoc of remoteDocs) {
        // Check if we have this locally
        const localDoc = await dbGet(storeName, remoteDoc.id);

        // If remote is newer or we don't have it
        if (!localDoc || (remoteDoc.updatedAt > localDoc.updatedAt)) {
          try {
            // Decrypt
            const decrypted = await decryptObject(remoteDoc, key);
            // Save to IndexedDB (no re-queue)
            decrypted.updatedAt = decrypted.updatedAt || Date.now();
            decrypted.createdAt = decrypted.createdAt || Date.now();
            await dbPut(storeName, decrypted);
          } catch (e) {
            console.warn('Failed to decrypt doc:', remoteDoc.id, e);
          }
        }
      }
    }
  } catch (e) {
    console.error('Pull error:', e);
  }
}

// Full initial sync after joining a couple
async function initialSync() {
  updateSyncIndicator('syncing');
  await performSync();
}

function updateSyncIndicator(status) {
  const dot = document.getElementById('syncDot');
  if (!dot) return;
  dot.className = 'w-2 h-2 rounded-full';
  switch (status) {
    case 'online': dot.classList.add('bg-green-400'); break;
    case 'syncing': dot.classList.add('bg-blush-400', 'animate-pulse'); break;
    case 'offline': dot.classList.add('bg-gray-400'); break;
    case 'error': dot.classList.add('bg-red-400'); break;
    default: dot.classList.add('bg-gray-300');
  }
}

async function forceSync() {
  updateSyncIndicator('syncing');
  await performSync();
}
