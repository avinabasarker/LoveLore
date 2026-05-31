// ==================== LoveLore App Logic ====================

let currentPin = '';
let isSettingPin = false;
let currentScreen = 'home';
let currentWikiTab = 'characters';
let currentLetterTab = 'openwhen';
let pendingDelete = null;
let countdownTimers = [];

// ==================== PIN LOGIC ====================

function pinInput(num) {
  if (currentPin.length >= 4) return;
  currentPin += num.toString();
  updatePinDisplay();

  // Auto-submit after 4 digits
  if (currentPin.length === 4) {
    setTimeout(() => submitPin(), 200);
  }
}

function pinDelete() {
  currentPin = currentPin.slice(0, -1);
  updatePinDisplay();
}

function updatePinDisplay() {
  const dots = document.querySelectorAll('#pinDisplay .pin-dot');
  dots.forEach((dot, i) => {
    if (i < currentPin.length) {
      dot.classList.add('filled');
    } else {
      dot.classList.remove('filled');
    }
  });
}

function submitPin() {
  if (currentPin.length !== 4) return;

  if (!hasPin()) {
    // First time setting PIN
    setStoredPin(currentPin);
    document.getElementById('pinMessage').textContent = 'PIN set! Unlocking...';
    setTimeout(() => unlockSuccess(), 500);
  } else {
    // Verify PIN
    if (currentPin === getStoredPin()) {
      document.getElementById('pinMessage').textContent = '';
      unlockSuccess();
    } else {
      // Wrong PIN
      const display = document.getElementById('pinDisplay');
      display.classList.add('shake');
      setTimeout(() => display.classList.remove('shake'), 500);
      document.getElementById('pinMessage').textContent = 'Wrong PIN';
      currentPin = '';
      updatePinDisplay();
    }
  }
}

function unlockSuccess() {
  const lock = document.getElementById('lockScreen');
  lock.style.transition = 'opacity 0.5s ease';
  lock.style.opacity = '0';
  setTimeout(() => {
    lock.style.display = 'none';
    currentPin = '';
    updatePinDisplay();

    if (hasCoupleCode()) {
      showMainApp();
    } else {
      document.getElementById('coupleCodeScreen').style.display = 'flex';
    }
  }, 500);
}

function lockApp() {
  document.getElementById('lockScreen').style.display = 'flex';
  document.getElementById('lockScreen').style.opacity = '1';
  document.getElementById('mainApp').style.display = 'none';
  document.getElementById('coupleCodeScreen').style.display = 'none';
  document.getElementById('showCodeScreen').style.display = 'none';
  currentPin = '';
  updatePinDisplay();
}

function changePin() {
  const newPin = prompt('Enter new 4-digit PIN:');
  if (newPin && newPin.length === 4 && /^\d{4}$/.test(newPin)) {
    setStoredPin(newPin);
    alert('PIN changed! Make sure your partner knows the new PIN.');
  } else if (newPin !== null) {
    alert('PIN must be exactly 4 digits.');
  }
}

// ==================== COUPLE CODE LOGIC ====================

async function createCouple() {
  const code = generateCoupleCode();
  setCoupleCode(code);

  // Generate and store encryption salt, then save it to Firestore
  const salt = getOrCreateSalt(); // This generates and stores locally
  const saltBase64 = getSaltBase64();

  // Save salt to Firestore so partner can fetch it
  const saved = await saveCoupleConfig(code, saltBase64);
  if (!saved) {
    alert('Failed to create couple. Check your internet connection.');
    localStorage.removeItem('ll_coupleCode');
    return;
  }

  // Show the code screen
  document.getElementById('coupleCodeScreen').style.display = 'none';
  document.getElementById('generatedCode').textContent = code;
  document.getElementById('showCodeScreen').style.display = 'flex';
}

async function joinCouple() {
  const input = document.getElementById('joinCodeInput').value.trim().toUpperCase();
  const errorEl = document.getElementById('joinError');

  if (input.length !== 6) {
    errorEl.textContent = 'Code must be 6 characters';
    errorEl.classList.remove('hidden');
    return;
  }

  errorEl.classList.add('hidden');

  // Fetch couple config from Firestore
  const config = await loadCoupleConfig(input);
  if (!config) {
    errorEl.textContent = 'Code not found. Check with your partner.';
    errorEl.classList.remove('hidden');
    return;
  }

  // Store couple code and salt locally
  setCoupleCode(input);
  setExternalSalt(config.salt);

  // Hide code screen, enter app
  document.getElementById('coupleCodeScreen').style.display = 'none';

  // Do an initial sync to pull all existing data
  await initialSync();
  showMainApp();
}

function enterApp() {
  document.getElementById('showCodeScreen').style.display = 'none';
  showMainApp();
}

function copyCode() {
  const code = getCoupleCode();
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code).then(() => {
      alert('Code copied!');
    }).catch(() => {
      prompt('Copy this code:', code);
    });
  } else {
    prompt('Copy this code:', code);
  }
}

function showCodeInfo() {
  const code = getCoupleCode();
  alert('Your couple code: ' + code + '\n\nShare this with your partner so they can join. Both of you use the same PIN.');
}

// ==================== MAIN APP ====================

function showMainApp() {
  document.getElementById('mainApp').style.display = 'block';

  // Show couple code in header and settings
  const code = getCoupleCode();
  const headerCode = document.getElementById('headerCode');
  const settingsCode = document.getElementById('settingsCode');
  if (headerCode) headerCode.textContent = code;
  if (settingsCode) settingsCode.textContent = code;

  // Load settings
  document.getElementById('settingDate').value = getStartDate() || '';

  // Start sync engine
  startSyncEngine();

  // Initial render
  refreshCurrentScreen();
  updateNerdStats();
  startCountdowns();

  // Trigger initial sync
  performSync();
}

// ==================== NAVIGATION ====================

function navigate(screen) {
  // Hide all screens
  ['homeScreen', 'wikiScreen', 'lettersScreen', 'settingsScreen', 'galleryScreen'].forEach(s => {
    document.getElementById(s).style.display = 'none';
  });

  // Show target
  const map = {
    home: 'homeScreen',
    wiki: 'wikiScreen',
    letters: 'lettersScreen',
    settings: 'settingsScreen',
    gallery: 'galleryScreen'
  };

  document.getElementById(map[screen]).style.display = 'block';
  currentScreen = screen;

  // Update nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.screen === screen);
  });

  // Hide FAB on gallery and settings
  const fab = document.getElementById('fabBtn');
  fab.style.display = (screen === 'gallery' || screen === 'settings') ? 'none' : 'flex';

  // Refresh content
  refreshCurrentScreen();
}

function refreshCurrentScreen() {
  switch (currentScreen) {
    case 'home': renderTimeline(); updateNerdStats(); break;
    case 'wiki': renderWikiTab(); break;
    case 'letters': renderLetterTab(); break;
    case 'gallery': renderGallery(); break;
    case 'settings': break;
  }
}

// ==================== TABS ====================

function showWikiTab(tab) {
  currentWikiTab = tab;
  document.querySelectorAll('#wikiScreen .tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  document.getElementById('charactersContainer').style.display = tab === 'characters' ? 'block' : 'none';
  document.getElementById('locationsContainer').style.display = tab === 'locations' ? 'block' : 'none';
  document.getElementById('jokesContainer').style.display = tab === 'jokes' ? 'block' : 'none';
  renderWikiTab();
}

function showLetterTab(tab) {
  currentLetterTab = tab;
  document.querySelectorAll('#lettersScreen .tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  document.getElementById('openwhenContainer').style.display = tab === 'openwhen' ? 'block' : 'none';
  document.getElementById('capsulesContainer').style.display = tab === 'capsules' ? 'block' : 'none';
  document.getElementById('firstsContainer').style.display = tab === 'firsts' ? 'block' : 'none';
  document.getElementById('fightsContainer').style.display = tab === 'fights' ? 'block' : 'none';
  document.getElementById('bucketContainer').style.display = tab === 'bucket' ? 'block' : 'none';
  renderLetterTab();
}

function renderWikiTab() {
  switch (currentWikiTab) {
    case 'characters': renderCharacters(); break;
    case 'locations': renderLocations(); break;
    case 'jokes': renderJokes(); break;
  }
}

function renderLetterTab() {
  switch (currentLetterTab) {
    case 'openwhen': renderOpenWhen(); break;
    case 'capsules': renderCapsules(); break;
    case 'firsts': renderFirsts(); break;
    case 'fights': renderFightLog(); break;
    case 'bucket': renderBucketList(); break;
  }
}

// ==================== MENU / MODAL ====================

function showAddMenu() {
  document.getElementById('addMenu').style.display = 'flex';
}

function hideAddMenu(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById('addMenu').style.display = 'none';
}

function showModal(name) {
  hideAddMenu();
  const modal = document.getElementById('modal' + capitalize(name));
  if (modal) modal.style.display = 'flex';
}

function hideModal(name, e) {
  if (e && e.target !== e.currentTarget) return;
  const modal = document.getElementById('modal' + capitalize(name));
  if (modal) modal.style.display = 'none';
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ==================== DELETE FUNCTIONALITY ====================

function confirmDelete(storeName, id) {
  pendingDelete = { storeName, id };
  document.getElementById('confirmDeleteBtn').onclick = executeDelete;
  document.getElementById('modalDeleteConfirm').style.display = 'flex';
}

async function executeDelete() {
  if (!pendingDelete) return;
  const { storeName, id } = pendingDelete;

  // Delete from IndexedDB
  await dbDelete(storeName, id);

  // Queue for Firebase deletion
  await addToSyncQueue(storeName, id, 'delete');

  pendingDelete = null;
  document.getElementById('modalDeleteConfirm').style.display = 'none';

  // Refresh
  refreshCurrentScreen();
  updateNerdStats();
}

// ==================== SAVE FUNCTIONS ====================

async function saveMemory() {
  const title = document.getElementById('memoryTitle').value.trim();
  const text = document.getElementById('memoryText').value.trim();
  const date = document.getElementById('memoryDate').value || todayStr();
  const fileInput = document.getElementById('memoryImage');

  if (!title && !text && !fileInput.files[0]) return;

  let image = null;
  if (fileInput.files[0]) {
    image = await compressImage(fileInput.files[0], 800, 0.6);
  }

  const data = {
    id: generateId(),
    type: 'memory',
    title, text, date, image,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  await saveAndQueue('memories', data);
  hideModal('addMemory');
  clearModalFields(['memoryTitle', 'memoryText', 'memoryDate', 'memoryImage']);
  renderTimeline();
  updateNerdStats();
}

async function saveGalleryPhoto() {
  const fileInput = document.getElementById('galleryPhotoFile');
  const date = document.getElementById('galleryPhotoDate').value || todayStr();

  if (!fileInput.files[0]) return;

  const image = await compressImage(fileInput.files[0], 800, 0.6);

  const data = {
    id: generateId(),
    type: 'gallery',
    title: '',
    text: '',
    date, image,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  await saveAndQueue('memories', data);
  hideModal('addGalleryPhoto');
  clearModalFields(['galleryPhotoFile', 'galleryPhotoDate']);
  renderGallery();
  updateNerdStats();
}

async function saveCharacter() {
  const name = document.getElementById('charName').value.trim();
  const description = document.getElementById('charDesc').value.trim();
  const fileInput = document.getElementById('charImage');

  if (!name) return;

  let image = null;
  if (fileInput.files[0]) {
    image = await compressImage(fileInput.files[0], 800, 0.6);
  }

  const data = {
    id: generateId(),
    type: 'character',
    name, description, image,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  await saveAndQueue('characters', data);
  hideModal('addCharacter');
  clearModalFields(['charName', 'charDesc', 'charImage']);
  renderCharacters();
}

async function saveLocation() {
  const name = document.getElementById('locName').value.trim();
  const description = document.getElementById('locDesc').value.trim();
  const fileInput = document.getElementById('locImage');

  if (!name) return;

  let image = null;
  if (fileInput.files[0]) {
    image = await compressImage(fileInput.files[0], 800, 0.6);
  }

  const data = {
    id: generateId(),
    type: 'location',
    name, description, image,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  await saveAndQueue('locations', data);
  hideModal('addLocation');
  clearModalFields(['locName', 'locDesc', 'locImage']);
  renderLocations();
}

async function saveJoke() {
  const title = document.getElementById('jokeTitle').value.trim();
  const text = document.getElementById('jokeText').value.trim();

  if (!text) return;

  const data = {
    id: generateId(),
    type: 'joke',
    title, text,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  await saveAndQueue('jokes', data);
  hideModal('addJoke');
  clearModalFields(['jokeTitle', 'jokeText']);
  renderJokes();
}

async function saveOpenWhen() {
  const condition = document.getElementById('owCondition').value.trim();
  const message = document.getElementById('owMessage').value.trim();

  if (!condition || !message) return;

  const data = {
    id: generateId(),
    type: 'letter',
    condition, message,
    opened: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  await saveAndQueue('letters', data);
  hideModal('addOpenWhen');
  clearModalFields(['owCondition', 'owMessage']);
  renderOpenWhen();
}

async function saveCapsule() {
  const title = document.getElementById('capsuleTitle').value.trim();
  const message = document.getElementById('capsuleMessage').value.trim();
  const openDate = document.getElementById('capsuleDate').value;
  const fileInput = document.getElementById('capsuleImage');

  if (!title || !openDate) return;

  let image = null;
  if (fileInput.files[0]) {
    image = await compressImage(fileInput.files[0], 800, 0.6);
  }

  const data = {
    id: generateId(),
    type: 'capsule',
    title, message, image,
    openDate,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  await saveAndQueue('capsules', data);
  hideModal('addCapsule');
  clearModalFields(['capsuleTitle', 'capsuleMessage', 'capsuleDate', 'capsuleImage']);
  renderCapsules();
  startCountdowns();
}

async function saveFirst() {
  const title = document.getElementById('firstTitle').value.trim();
  const date = document.getElementById('firstDate').value;
  const description = document.getElementById('firstDesc').value.trim();

  if (!title) return;

  const data = {
    id: generateId(),
    type: 'first',
    title, date, description,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  await saveAndQueue('firsts', data);
  hideModal('addFirst');
  clearModalFields(['firstTitle', 'firstDate', 'firstDesc']);
  renderFirsts();
}

async function saveFightLog() {
  const title = document.getElementById('fightTitle').value.trim();
  const description = document.getElementById('fightDesc').value.trim();
  const date = document.getElementById('fightDate').value || todayStr();

  if (!title) return;

  const data = {
    id: generateId(),
    type: 'fight',
    title, description, date,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  await saveAndQueue('fightlog', data);
  hideModal('addFight');
  clearModalFields(['fightTitle', 'fightDesc', 'fightDate']);
  renderFightLog();
}

async function saveBucketItem() {
  const title = document.getElementById('bucketTitle').value.trim();

  if (!title) return;

  const data = {
    id: generateId(),
    type: 'bucket',
    title,
    done: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  await saveAndQueue('bucketlist', data);
  hideModal('addBucket');
  clearModalFields(['bucketTitle']);
  renderBucketList();
}

function clearModalFields(ids) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

// ==================== RENDER FUNCTIONS ====================

async function renderTimeline() {
  const container = document.getElementById('timelineContainer');
  const items = await dbGetAllSorted('memories', 'createdAt', 'desc');
  const memories = items.filter(i => i.type === 'memory' || !i.type);

  if (memories.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-heart text-4xl text-blush-200 mb-3"></i>
        <p class="text-gray-400 text-sm">No memories yet</p>
        <p class="text-gray-300 text-xs">Tap + to add your first memory</p>
      </div>`;
    return;
  }

  container.innerHTML = memories.map(m => {
    const imgHtml = m.image
      ? `<img class="card-img" src="${m.image}" alt="" onclick="viewFullImage('${m.image.replace(/'/g, "\\'")}')">`
      : '';
    const titleHtml = m.title ? `<div class="card-title">${escapeHtml(m.title)}</div>` : '';
    const textHtml = m.text ? `<div class="card-text">${escapeHtml(m.text)}</div>` : '';

    return `
      <div class="timeline-card">
        <button class="card-delete-btn" onclick="event.stopPropagation(); confirmDelete('memories', '${m.id}')">
          <i class="fa-solid fa-xmark"></i>
        </button>
        ${imgHtml}
        ${(titleHtml || textHtml) ? `<div class="card-body">${titleHtml}${textHtml}<div class="card-date">${formatDate(m.date)}</div></div>` : `<div class="card-date" style="padding:0.5rem 1rem">${formatDate(m.date)}</div>`}
      </div>`;
  }).join('');
}

async function renderGallery() {
  const grid = document.getElementById('galleryGrid');
  const emptyState = document.getElementById('galleryEmpty');
  const items = await dbGetAllSorted('memories', 'createdAt', 'desc');
  const photos = items.filter(i => i.image);

  if (photos.length === 0) {
    grid.style.display = 'none';
    emptyState.style.display = 'flex';
    return;
  }

  grid.style.display = 'grid';
  emptyState.style.display = 'none';

  grid.innerHTML = photos.map(p => `
    <div class="gallery-item" onclick="viewFullImage('${p.image.replace(/'/g, "\\'")}')">
      <button class="card-delete-btn" style="opacity:0.7" onclick="event.stopPropagation(); confirmDelete('memories', '${p.id}')">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <img src="${p.image}" alt="">
      <div class="gallery-date">${formatDateShort(p.date)}</div>
    </div>
  `).join('');
}

async function renderCharacters() {
  const container = document.getElementById('charactersContainer');
  const items = await dbGetAll('characters');
  const emptyEl = document.getElementById('wikiEmpty');

  if (items.length === 0) {
    container.innerHTML = '';
    emptyEl.style.display = 'flex';
    return;
  }
  emptyEl.style.display = 'none';

  container.innerHTML = items.map(c => `
    <div class="character-card" onclick="viewCharacter('${c.id}')">
      <button class="card-delete-btn" onclick="event.stopPropagation(); confirmDelete('characters', '${c.id}')">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <div class="flex items-center gap-3">
        ${c.image ? `<img src="${c.image}" class="w-12 h-12 rounded-full object-cover">` : '<div class="w-12 h-12 rounded-full bg-blush-100 flex items-center justify-center"><i class="fa-solid fa-user text-blush-400"></i></div>'}
        <div>
          <div class="font-bold text-sm">${escapeHtml(c.name)}</div>
          <div class="text-xs text-gray-500 line-clamp-1">${escapeHtml(c.description || '')}</div>
        </div>
      </div>
    </div>
  `).join('');
}

async function renderLocations() {
  const container = document.getElementById('locationsContainer');
  const items = await dbGetAll('locations');
  const emptyEl = document.getElementById('wikiEmpty');

  if (items.length === 0) {
    container.innerHTML = '';
    emptyEl.style.display = 'flex';
    return;
  }
  emptyEl.style.display = 'none';

  container.innerHTML = items.map(l => `
    <div class="location-card">
      <button class="card-delete-btn" onclick="event.stopPropagation(); confirmDelete('locations', '${l.id}')">
        <i class="fa-solid fa-xmark"></i>
      </button>
      ${l.image ? `<img src="${l.image}" class="w-full h-32 object-cover">` : ''}
      <div class="p-3">
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-map-pin text-blush-400 text-xs"></i>
          <span class="font-bold text-sm">${escapeHtml(l.name)}</span>
        </div>
        ${l.description ? `<div class="text-xs text-gray-500 mt-1">${escapeHtml(l.description)}</div>` : ''}
      </div>
    </div>
  `).join('');
}

async function renderJokes() {
  const container = document.getElementById('jokesContainer');
  const items = await dbGetAll('jokes');
  const emptyEl = document.getElementById('wikiEmpty');

  if (items.length === 0) {
    container.innerHTML = '';
    emptyEl.style.display = 'flex';
    return;
  }
  emptyEl.style.display = 'none';

  container.innerHTML = items.map(j => `
    <div class="joke-card">
      <button class="card-delete-btn" onclick="event.stopPropagation(); confirmDelete('jokes', '${j.id}')">
        <i class="fa-solid fa-xmark"></i>
      </button>
      ${j.title ? `<div class="font-bold text-sm mb-1">${escapeHtml(j.title)}</div>` : ''}
      <div class="text-sm text-gray-600">${escapeHtml(j.text)}</div>
    </div>
  `).join('');
}

async function renderOpenWhen() {
  const container = document.getElementById('openwhenContainer');
  const items = await dbGetAll('letters');
  const emptyEl = document.getElementById('lettersEmpty');

  if (items.length === 0) {
    container.innerHTML = '';
    emptyEl.style.display = 'flex';
    return;
  }
  emptyEl.style.display = 'none';

  container.innerHTML = items.map(l => {
    const isOpen = l.opened;
    return `
      <div class="envelope-card ${isOpen ? '' : 'locked'}" onclick="${isOpen ? `viewLetter('${l.id}')` : `openLetter('${l.id}')`}">
        <button class="card-delete-btn" onclick="event.stopPropagation(); confirmDelete('letters', '${l.id}')">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full ${isOpen ? 'bg-blush-100' : 'bg-gray-100'} flex items-center justify-center">
            <i class="fa-solid ${isOpen ? 'fa-envelope-open text-blush-500' : 'fa-lock text-gray-400'}"></i>
          </div>
          <div class="envelope-content">
            <div class="font-semibold text-sm">${isOpen ? escapeHtml(l.condition) : 'Sealed envelope'}</div>
            <div class="text-xs text-gray-400 mt-0.5">${isOpen ? 'Tap to re-read' : 'Tap to open'}</div>
          </div>
        </div>
      </div>`;
  }).join('');
}

async function renderCapsules() {
  const container = document.getElementById('capsulesContainer');
  const items = await dbGetAll('capsules');
  const emptyEl = document.getElementById('lettersEmpty');

  if (items.length === 0) {
    container.innerHTML = '';
    emptyEl.style.display = 'flex';
    return;
  }
  emptyEl.style.display = 'none';

  container.innerHTML = items.map(c => {
    const cd = getCountdown(c.openDate);
    const isLocked = !cd.done;
    return `
      <div class="capsule-card ${isLocked ? 'locked' : ''}" onclick="${isLocked ? '' : `viewCapsule('${c.id}')`}">
        <button class="card-delete-btn" onclick="event.stopPropagation(); confirmDelete('capsules', '${c.id}')">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <div class="capsule-content">
          <div class="flex items-center gap-2 mb-1">
            <i class="fa-solid fa-hourglass text-sage-500"></i>
            <span class="font-bold text-sm">${escapeHtml(c.title)}</span>
          </div>
          ${isLocked ? `
            <div class="text-xs text-gray-400 mb-2">Opens ${formatDate(c.openDate)}</div>
            <div class="countdown-units" data-capsule-date="${c.openDate}">
              <div class="countdown-unit"><span class="num cd-days">0</span><span class="lbl">days</span></div>
              <div class="countdown-unit"><span class="num cd-hours">0</span><span class="lbl">hrs</span></div>
              <div class="countdown-unit"><span class="num cd-mins">0</span><span class="lbl">min</span></div>
              <div class="countdown-unit"><span class="num cd-secs">0</span><span class="lbl">sec</span></div>
            </div>
          ` : `
            <div class="text-xs text-sage-600 font-medium">Ready to open!</div>
          `}
        </div>
      </div>`;
  }).join('');

  startCountdowns();
}

async function renderFirsts() {
  const container = document.getElementById('firstsContainer');
  const items = await dbGetAll('firsts');
  const emptyEl = document.getElementById('lettersEmpty');

  if (items.length === 0) {
    container.innerHTML = '';
    emptyEl.style.display = 'flex';
    return;
  }
  emptyEl.style.display = 'none';

  container.innerHTML = items.map(f => `
    <div class="firsts-card">
      <button class="card-delete-btn" onclick="event.stopPropagation(); confirmDelete('firsts', '${f.id}')">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-blush-100 flex items-center justify-center">
          <i class="fa-solid fa-star text-blush-400"></i>
        </div>
        <div>
          <div class="font-bold text-sm">${escapeHtml(f.title)}</div>
          ${f.date ? `<div class="text-xs text-gray-400">${formatDate(f.date)}</div>` : ''}
          ${f.description ? `<div class="text-xs text-gray-500 mt-0.5">${escapeHtml(f.description)}</div>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

async function renderFightLog() {
  const container = document.getElementById('fightsContainer');
  const items = await dbGetAllSorted('fightlog', 'createdAt', 'desc');
  const emptyEl = document.getElementById('lettersEmpty');

  if (items.length === 0) {
    container.innerHTML = '';
    emptyEl.style.display = 'flex';
    return;
  }
  emptyEl.style.display = 'none';

  container.innerHTML = items.map(f => `
    <div class="fight-card">
      <button class="card-delete-btn" onclick="event.stopPropagation(); confirmDelete('fightlog', '${f.id}')">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <div class="flex items-center gap-2 mb-1">
        <i class="fa-solid fa-fire text-red-400 text-xs"></i>
        <span class="font-bold text-sm">${escapeHtml(f.title)}</span>
      </div>
      ${f.description ? `<div class="text-xs text-gray-600">${escapeHtml(f.description)}</div>` : ''}
      ${f.date ? `<div class="text-xs text-gray-400 mt-1">${formatDate(f.date)}</div>` : ''}
    </div>
  `).join('');
}

async function renderBucketList() {
  const container = document.getElementById('bucketContainer');
  const items = await dbGetAll('bucketlist');
  const emptyEl = document.getElementById('lettersEmpty');

  if (items.length === 0) {
    container.innerHTML = '';
    emptyEl.style.display = 'flex';
    return;
  }
  emptyEl.style.display = 'none';

  container.innerHTML = items.map(b => `
    <div class="bucket-item ${b.done ? 'done' : ''}" onclick="toggleBucket('${b.id}')">
      <button class="card-delete-btn" onclick="event.stopPropagation(); confirmDelete('bucketlist', '${b.id}')">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <div class="bucket-check">
        ${b.done ? '<i class="fa-solid fa-check text-xs"></i>' : ''}
      </div>
      <span class="bucket-text text-sm">${escapeHtml(b.title)}</span>
    </div>
  `).join('');
}

// ==================== ACTIONS ====================

function viewFullImage(imageSrc) {
  document.getElementById('fullImageView').src = imageSrc;
  document.getElementById('modalViewImage').style.display = 'flex';
}

async function openLetter(id) {
  const letter = await dbGet('letters', id);
  if (!letter) return;
  letter.opened = true;
  letter.updatedAt = Date.now();
  await saveAndQueue('letters', letter);
  viewLetter(id);
}

async function viewLetter(id) {
  const letter = await dbGet('letters', id);
  if (!letter) return;
  document.getElementById('viewLetterTitle').textContent = 'Open when ' + (letter.condition || '');
  document.getElementById('viewLetterMessage').textContent = letter.message || '';
  document.getElementById('modalViewLetter').style.display = 'flex';
}

async function viewCapsule(id) {
  const capsule = await dbGet('capsules', id);
  if (!capsule) return;
  const cd = getCountdown(capsule.openDate);
  if (!cd.done) return;

  document.getElementById('viewCapsuleTitle').textContent = capsule.title || '';
  document.getElementById('viewCapsuleMessage').textContent = capsule.message || '';
  const imgDiv = document.getElementById('viewCapsuleImage');
  if (capsule.image) {
    imgDiv.innerHTML = `<img src="${capsule.image}" class="w-full rounded-xl">`;
  } else {
    imgDiv.innerHTML = '';
  }
  document.getElementById('modalViewCapsule').style.display = 'flex';
}

async function viewCharacter(id) {
  const char = await dbGet('characters', id);
  if (!char) return;
  const content = document.getElementById('viewCharContent');
  content.innerHTML = `
    <div class="text-center mb-3">
      ${char.image ? `<img src="${char.image}" class="w-20 h-20 rounded-full object-cover mx-auto mb-2">` : '<div class="w-20 h-20 rounded-full bg-blush-100 flex items-center justify-center mx-auto mb-2"><i class="fa-solid fa-user text-3xl text-blush-400"></i></div>'}
      <h3 class="font-bold">${escapeHtml(char.name)}</h3>
    </div>
    <p class="text-sm text-gray-600 leading-relaxed">${escapeHtml(char.description || 'No description')}</p>
  `;
  document.getElementById('modalViewCharacter').style.display = 'flex';
}

async function toggleBucket(id) {
  const item = await dbGet('bucketlist', id);
  if (!item) return;
  item.done = !item.done;
  item.updatedAt = Date.now();
  await saveAndQueue('bucketlist', item);
  renderBucketList();
}

// ==================== COUNTDOWNS ====================

function startCountdowns() {
  countdownTimers.forEach(t => clearInterval(t));
  countdownTimers = [];

  const tick = () => {
    document.querySelectorAll('[data-capsule-date]').forEach(el => {
      const date = el.dataset.capsuleDate;
      const cd = getCountdown(date);
      if (cd.done) {
        el.innerHTML = '<div class="text-xs text-sage-600 font-medium">Ready to open!</div>';
        return;
      }
      const daysEl = el.querySelector('.cd-days');
      const hoursEl = el.querySelector('.cd-hours');
      const minsEl = el.querySelector('.cd-mins');
      const secsEl = el.querySelector('.cd-secs');
      if (daysEl) daysEl.textContent = cd.days;
      if (hoursEl) hoursEl.textContent = cd.hours;
      if (minsEl) minsEl.textContent = cd.minutes;
      if (secsEl) secsEl.textContent = cd.seconds;
    });
  };

  tick();
  const timer = setInterval(tick, 1000);
  countdownTimers.push(timer);
}

// ==================== NERD STATS ====================

async function updateNerdStats() {
  const startDate = getStartDate();
  const days = startDate ? daysBetween(startDate) : 0;
  document.getElementById('daysTogether').textContent = Math.max(0, days);

  const allMemories = await dbGetAll('memories');
  const memoryCount = allMemories.filter(m => m.type === 'memory' || !m.type).length;
  document.getElementById('memoriesCount').textContent = memoryCount;

  const photoCount = allMemories.filter(m => m.image).length;
  document.getElementById('photosCount').textContent = photoCount;
}

// ==================== CLEAR ALL DATA ====================

async function clearAllData() {
  if (!confirm('This will delete ALL your data. Are you sure?')) return;
  if (!confirm('Really? This cannot be undone!')) return;

  for (const name of STORE_NAMES) {
    await dbClear(name);
  }

  localStorage.removeItem('ll_pin');
  localStorage.removeItem('ll_coupleCode');
  localStorage.removeItem('ll_startDate');
  localStorage.removeItem('ll_crypto_salt');

  location.reload();
}

// ==================== INIT ====================

async function initApp() {
  await openDB();

  if (!hasPin()) {
    isSettingPin = true;
    document.getElementById('pinMessage').textContent = 'Set your 4-digit PIN';
  }

  // Pre-set anniversary date
  if (!getStartDate()) {
    setStartDate('2026-05-29');
  }

  // Init Firebase in background
  const fbOk = await initFirebase();
  if (fbOk) {
    await signInAnonymously();
    // Don't start sync engine yet - wait until couple code is set
  }

  // Set default dates on modals
  document.getElementById('memoryDate').value = todayStr();
  document.getElementById('galleryPhotoDate').value = todayStr();
  document.getElementById('fightDate').value = todayStr();

  // If already have couple code and PIN, sync engine will start in showMainApp
}

// Boot
document.addEventListener('DOMContentLoaded', initApp);
