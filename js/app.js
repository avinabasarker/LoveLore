/* ============================================ */
/* LoveLore — Main Application Logic            */
/* ============================================ */

let currentPin = '';
let currentScreen = 'home';
let countdownTimer = null;

// ---- PIN Logic ----

function pinInput(digit) {
  if (currentPin.length >= 4) return;
  currentPin += digit;
  updatePinDisplay();
  if (currentPin.length === 4) {
    if (!hasPin()) {
      document.getElementById('setPinBtn').classList.remove('hidden');
      document.getElementById('pinEnterBtn').classList.add('hidden');
    }
  }
}

function pinDelete() {
  currentPin = currentPin.slice(0, -1);
  updatePinDisplay();
  document.getElementById('pinError').textContent = '';
  document.getElementById('setPinBtn').classList.add('hidden');
  if (hasPin()) document.getElementById('pinEnterBtn').classList.remove('hidden');
}

function updatePinDisplay() {
  const chars = document.querySelectorAll('.pin-char');
  chars.forEach(function(el, i) {
    if (i < currentPin.length) {
      el.textContent = '\u2022';
      el.classList.add('filled');
    } else {
      el.textContent = '\u2022';
      el.classList.remove('filled');
    }
  });
}

function submitPin() {
  if (currentPin.length !== 4) return;
  var stored = getStoredPin();
  if (currentPin === stored) {
    unlockSuccess();
  } else {
    var display = document.getElementById('pinDisplay');
    display.classList.add('shake');
    document.getElementById('pinError').textContent = 'Wrong PIN. Try again.';
    currentPin = '';
    updatePinDisplay();
    setTimeout(function() { display.classList.remove('shake'); }, 500);
  }
}

function setFirstPin() {
  if (currentPin.length !== 4) return;
  setStoredPin(currentPin);
  unlockSuccess();
}

function changePin() {
  var newPin = document.getElementById('newPinInput').value;
  if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
    alert('PIN must be exactly 4 digits');
    return;
  }
  setStoredPin(newPin);
  document.getElementById('newPinInput').value = '';
  alert('PIN updated! Make sure your partner knows the new PIN.');
}

function unlockSuccess() {
  var lock = document.getElementById('lockScreen');
  lock.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  lock.style.opacity = '0';
  lock.style.transform = 'scale(1.05)';
  setTimeout(function() {
    lock.style.display = 'none';
    if (hasCoupleCode()) {
      showAppShell();
    } else {
      document.getElementById('coupleCodeScreen').style.display = 'flex';
    }
  }, 500);
}

// ---- Couple Code Logic ----

async function createCouple() {
  var code = generateCoupleCode();
  setCoupleCode(code);

  // Generate salt and save to Firestore so partner can get it
  getOrCreateSalt(); // This generates and stores locally if needed
  var saltBase64 = getSaltBase64();

  var saved = await saveCoupleConfig(code, saltBase64);
  if (!saved) {
    alert('Failed to create couple. Check your internet connection.');
    localStorage.removeItem('lovelore_couple_code');
    return;
  }

  // Show the code
  document.getElementById('coupleCodeScreen').style.display = 'none';
  document.getElementById('generatedCode').textContent = code;
  document.getElementById('showCodeScreen').style.display = 'flex';
}

async function joinCouple() {
  var input = document.getElementById('joinCodeInput').value.trim().toUpperCase();
  var errorEl = document.getElementById('joinError');

  if (input.length !== 6) {
    errorEl.textContent = 'Code must be 6 characters';
    errorEl.classList.remove('hidden');
    return;
  }

  errorEl.classList.add('hidden');

  // Fetch couple config from Firestore
  var config = await loadCoupleConfig(input);
  if (!config) {
    errorEl.textContent = 'Code not found. Check with your partner.';
    errorEl.classList.remove('hidden');
    return;
  }

  // Store couple code and salt locally
  setCoupleCode(input);
  setExternalSalt(config.salt);

  // Hide code screen and enter app
  document.getElementById('coupleCodeScreen').style.display = 'none';

  // Do an initial sync to pull all existing data
  await initialSync();
  showAppShell();
}

function enterApp() {
  document.getElementById('showCodeScreen').style.display = 'none';
  showAppShell();
}

function copyCode() {
  var code = getCoupleCode();
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code).then(function() {
      alert('Code copied!');
    }).catch(function() {
      prompt('Copy this code:', code);
    });
  } else {
    prompt('Copy this code:', code);
  }
}

function showCodeInfo() {
  var code = getCoupleCode();
  alert('Your couple code: ' + code + '\n\nShare this with your partner so they can join.\nBoth of you use the same PIN.');
}

// ---- Show App Shell ----

function showAppShell() {
  var shell = document.getElementById('appShell');
  shell.style.display = 'flex';
  shell.style.opacity = '0';
  shell.style.transition = 'opacity 0.4s ease';
  setTimeout(function() { shell.style.opacity = '1'; }, 50);

  // Show couple code in header and settings
  var code = getCoupleCode();
  document.getElementById('coupleCodeBadge').textContent = code;
  document.getElementById('settingsCode').textContent = code;

  initApp();
}

function lockApp() {
  currentPin = '';
  updatePinDisplay();
  document.getElementById('pinError').textContent = '';
  document.getElementById('lockScreen').style.display = 'flex';
  document.getElementById('lockScreen').style.opacity = '1';
  document.getElementById('lockScreen').style.transform = 'scale(1)';
  document.getElementById('appShell').style.display = 'none';
  document.getElementById('pinEnterBtn').classList.remove('hidden');
  document.getElementById('setPinBtn').classList.add('hidden');
  if (countdownTimer) clearInterval(countdownTimer);
}

// ---- Navigation ----

function navigate(screen) {
  currentScreen = screen;
  document.querySelectorAll('.screen').forEach(function(el) { el.style.display = 'none'; });
  var target = document.getElementById('screen' + screen.charAt(0).toUpperCase() + screen.slice(1));
  if (target) {
    target.style.display = 'block';
    target.classList.remove('page-enter');
    void target.offsetWidth;
    target.classList.add('page-enter');
  }
  document.querySelectorAll('.nav-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.screen === screen);
  });

  // Hide FAB on gallery screen
  var fab = document.getElementById('fabAdd');
  fab.style.display = (screen === 'gallery') ? 'none' : 'flex';

  refreshCurrentScreen();
  document.getElementById('mainContent').scrollTop = 0;
}

function refreshCurrentScreen() {
  switch (currentScreen) {
    case 'home': renderTimeline(); updateNerdStats(); break;
    case 'gallery': renderGallery(); break;
    case 'wiki': renderCharacters(); renderLocations(); renderJokes(); break;
    case 'letters': renderOpenWhen(); renderCapsules(); renderFirsts(); startCountdowns(); break;
    case 'settings': renderFightLog(); renderBucketList(); break;
  }
}

// ---- Wiki Tabs ----

function showWikiTab(tab) {
  document.querySelectorAll('.wiki-content').forEach(function(el) { el.style.display = 'none'; });
  document.querySelectorAll('.tab-bar .tab-btn').forEach(function(btn) {
    if (btn.dataset && btn.dataset.tab) btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  var target = document.getElementById('wiki' + tab.charAt(0).toUpperCase() + tab.slice(1));
  if (target) target.style.display = 'block';
}

// ---- Letter Tabs ----

function showLetterTab(tab) {
  document.querySelectorAll('.letter-content').forEach(function(el) { el.style.display = 'none'; });
  document.querySelectorAll('.tab-bar .tab-btn').forEach(function(btn) {
    if (btn.dataset && btn.dataset.tab) btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  if (tab === 'openwhen') document.getElementById('letterOpenWhen').style.display = 'block';
  else if (tab === 'capsules') document.getElementById('letterCapsules').style.display = 'block';
  else if (tab === 'firsts') document.getElementById('letterFirsts').style.display = 'block';
  if (tab === 'capsules') startCountdowns();
}

// ---- Add Menu ----

function showAddMenu() {
  var menu = document.getElementById('addMenu');
  menu.style.display = 'block';
  setTimeout(function() { document.getElementById('addMenuPanel').style.transform = 'translateY(0)'; }, 10);
}

function hideAddMenu() {
  document.getElementById('addMenuPanel').style.transform = 'translateY(100%)';
  setTimeout(function() { document.getElementById('addMenu').style.display = 'none'; }, 500);
}

// ---- Modals ----

function showModal(id) { document.getElementById(id).style.display = 'flex'; }
function hideModal(id) { document.getElementById(id).style.display = 'none'; }

// ============================================
// DELETE FUNCTIONS
// ============================================

async function deleteItem(storeName, id, label) {
  if (!confirm('Delete this ' + label + '? This cannot be undone.')) return;
  await dbDelete(storeName, id);
  await addToSyncQueue('delete', storeName, { id: id });
  refreshCurrentScreen();
  updateNerdStats();
}

// ============================================
// SAVE FUNCTIONS
// ============================================

async function saveMemory() {
  var dateVal = document.getElementById('memoryDate').value || todayStr();
  var title = document.getElementById('memoryTitle').value.trim();
  var desc = document.getElementById('memoryDesc').value.trim();
  var photoFile = document.getElementById('memoryPhoto').files[0];
  var audioFile = document.getElementById('memoryAudio').files[0];
  if (!title) { alert('Please add a title'); return; }

  var photoData = '';
  if (photoFile) photoData = await compressImage(photoFile);
  var audioData = '';
  if (audioFile) audioData = await fileToBase64(audioFile);

  var id = generateId();
  var item = {
    id: id, type: 'memory', date: dateVal,
    title: title, description: desc,
    photo: photoData, audio: audioData,
    audioName: audioFile ? audioFile.name : '',
    createdAt: Date.now(), updatedAt: Date.now(), _new: true
  };
  await saveAndQueue('memories', item);
  hideModal('modalTimeline');
  clearModal('modalTimeline');
  renderTimeline();
  updateNerdStats();
}

async function saveGalleryPhoto() {
  var photoFile = document.getElementById('galleryPhotoFile').files[0];
  var dateVal = document.getElementById('galleryPhotoDate').value || todayStr();
  if (!photoFile) { alert('Please select a photo'); return; }

  var photoData = await compressImage(photoFile);
  var id = generateId();
  var item = {
    id: id, type: 'gallery_photo', date: dateVal,
    title: '', description: '',
    photo: photoData,
    createdAt: Date.now(), updatedAt: Date.now(), _new: true
  };
  await saveAndQueue('memories', item);
  hideModal('modalGalleryUpload');
  clearModal('modalGalleryUpload');
  renderGallery();
  updateNerdStats();
}

async function saveCharacter() {
  var name = document.getElementById('charName').value.trim();
  var role = document.getElementById('charRole').value.trim();
  var bio = document.getElementById('charBio').value.trim();
  var photoFile = document.getElementById('charPhoto').files[0];
  var tags = document.getElementById('charTags').value.trim();
  if (!name) { alert('Please add a name'); return; }

  var photoData = '';
  if (photoFile) photoData = await compressImage(photoFile);

  var id = generateId();
  var item = {
    id: id, type: 'character', name: name, role: role, bio: bio,
    photo: photoData, tags: tags,
    createdAt: Date.now(), updatedAt: Date.now(), _new: true
  };
  await saveAndQueue('characters', item);
  hideModal('modalCharacter');
  clearModal('modalCharacter');
  renderCharacters();
}

async function saveLocation() {
  var name = document.getElementById('locName').value.trim();
  var history = document.getElementById('locHistory').value.trim();
  var photoFile = document.getElementById('locPhoto').files[0];
  if (!name) { alert('Please add a location name'); return; }

  var photoData = '';
  if (photoFile) photoData = await compressImage(photoFile);

  var id = generateId();
  var item = {
    id: id, type: 'location', name: name, history: history,
    coverPhoto: photoData,
    createdAt: Date.now(), updatedAt: Date.now(), _new: true
  };
  await saveAndQueue('locations', item);
  hideModal('modalLocation');
  clearModal('modalLocation');
  renderLocations();
}

async function saveJoke() {
  var term = document.getElementById('jokeTerm').value.trim();
  var definition = document.getElementById('jokeDef').value.trim();
  var originStory = document.getElementById('jokeOrigin').value.trim();
  if (!term) { alert('Please add the term'); return; }

  var id = generateId();
  var item = {
    id: id, type: 'joke', term: term, definition: definition, originStory: originStory,
    createdAt: Date.now(), updatedAt: Date.now(), _new: true
  };
  await saveAndQueue('jokes', item);
  hideModal('modalJoke');
  clearModal('modalJoke');
  renderJokes();
}

async function saveOpenWhen() {
  var title = document.getElementById('letterTitle').value.trim();
  var body = document.getElementById('letterBody').value.trim();
  var photoFile = document.getElementById('letterPhoto').files[0];
  if (!title || !body) { alert('Please add title and letter body'); return; }

  var photoData = '';
  if (photoFile) photoData = await compressImage(photoFile);

  var id = generateId();
  var item = {
    id: id, type: 'openwhen', title: title, body: body,
    photo: photoData, opened: false,
    createdAt: Date.now(), updatedAt: Date.now(), _new: true
  };
  await saveAndQueue('letters', item);
  hideModal('modalOpenWhen');
  clearModal('modalOpenWhen');
  renderOpenWhen();
}

async function saveCapsule() {
  var title = document.getElementById('capsuleTitle').value.trim();
  var body = document.getElementById('capsuleBody').value.trim();
  var unlockDate = document.getElementById('capsuleDate').value;
  var photoFile = document.getElementById('capsulePhoto').files[0];
  if (!title || !body || !unlockDate) { alert('Please fill all fields'); return; }

  var photoData = '';
  if (photoFile) photoData = await compressImage(photoFile);

  var id = generateId();
  var item = {
    id: id, type: 'capsule', title: title, body: body,
    photo: photoData, unlockDate: unlockDate, opened: false,
    createdAt: Date.now(), updatedAt: Date.now(), _new: true
  };
  await saveAndQueue('capsules', item);
  hideModal('modalCapsule');
  clearModal('modalCapsule');
  renderCapsules();
}

async function saveFirst() {
  var date = document.getElementById('firstDate').value || todayStr();
  var title = document.getElementById('firstTitle').value.trim();
  var desc = document.getElementById('firstDesc').value.trim();
  if (!title) { alert('Please add a title'); return; }

  var id = generateId();
  var item = {
    id: id, type: 'first', date: date, title: title, description: desc,
    createdAt: Date.now(), updatedAt: Date.now(), _new: true
  };
  await saveAndQueue('firsts', item);
  hideModal('modalFirst');
  clearModal('modalFirst');
  renderFirsts();
}

async function saveFightLog() {
  var whatHappened = document.getElementById('fightWhat').value.trim();
  var howResolved = document.getElementById('fightResolved').value.trim();
  var lessonLearned = document.getElementById('fightLesson').value.trim();
  if (!whatHappened) { alert('Please describe what happened'); return; }

  var id = generateId();
  var item = {
    id: id, type: 'fightlog', whatHappened: whatHappened,
    howResolved: howResolved, lessonLearned: lessonLearned,
    createdAt: Date.now(), updatedAt: Date.now(), _new: true
  };
  await saveAndQueue('fightlog', item);
  hideModal('modalFightLog');
  clearModal('modalFightLog');
  renderFightLog();
}

async function saveBucketItem() {
  var title = document.getElementById('bucketTitle').value.trim();
  var details = document.getElementById('bucketDetails').value.trim();
  if (!title) { alert('Please add an item'); return; }

  var id = generateId();
  var item = {
    id: id, type: 'bucket', title: title, details: details,
    completed: false,
    createdAt: Date.now(), updatedAt: Date.now(), _new: true
  };
  await saveAndQueue('bucketlist', item);
  hideModal('modalBucketList');
  clearModal('modalBucketList');
  renderBucketList();
}

function clearModal(modalId) {
  var modal = document.getElementById(modalId);
  if (!modal) return;
  modal.querySelectorAll('input[type="text"],input[type="password"],input[type="date"],input[type="datetime-local"],textarea').forEach(function(el) { el.value = ''; });
  modal.querySelectorAll('input[type="file"]').forEach(function(el) { el.value = ''; });
}

// ============================================
// RENDER FUNCTIONS
// ============================================

async function renderTimeline() {
  var allItems = await dbGetAllSorted('memories', 'date', true);
  // Filter out gallery-only photos (they belong in gallery, not timeline)
  var items = allItems.filter(function(item) { return item.type !== 'gallery_photo'; });
  var feed = document.getElementById('timelineFeed');
  var empty = document.getElementById('timelineEmpty');

  if (items.length === 0) { feed.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';

  feed.innerHTML = items.map(function(item) {
    var photoHtml = '';
    if (item.photo) {
      photoHtml = '<img src="' + escapeHtml(item.photo) + '" alt="" onclick="viewFullImage(\'' + item.id + '\')" style="cursor:pointer" />';
    }
    var audioHtml = '';
    if (item.audio) {
      var audioId = 'audio_' + item.id;
      audioHtml = '<div class="audio-player">' +
        '<button onclick="toggleAudio(\'' + audioId + '\', this)"><i class="fa-solid fa-play"></i></button>' +
        '<span>' + escapeHtml(item.audioName || 'Voice memo') + '</span>' +
        '<audio id="' + audioId + '" src="' + escapeHtml(item.audio) + '" preload="none"></audio>' +
        '</div>';
    }
    return '<div class="timeline-card">' +
      '<div class="timeline-card-header">' +
        '<p class="text-xs text-blush-400 font-medium">' + escapeHtml(formatDateShort(item.date)) + '</p>' +
        '<button class="btn-danger" onclick="deleteItem(\'memories\',\'' + item.id + '\',\'memory\')"><i class="fa-solid fa-trash-can mr-0.5"></i> Delete</button>' +
      '</div>' +
      '<h3 class="text-base font-bold text-charcoal-800 mb-1">' + escapeHtml(item.title) + '</h3>' +
      (item.description ? '<p class="text-sm text-charcoal-600 leading-relaxed">' + escapeHtml(item.description) + '</p>' : '') +
      photoHtml + audioHtml +
      '</div>';
  }).join('');
}

// ---- Gallery Screen ----

async function renderGallery() {
  var memories = await dbGetAll('memories');
  var letters = await dbGetAll('letters');
  var capsules = await dbGetAll('capsules');
  var locations = await dbGetAll('locations');
  var characters = await dbGetAll('characters');

  var allPhotos = [];

  memories.forEach(function(m) {
    if (m.photo) allPhotos.push({ src: m.photo, date: m.date || '', title: m.title || '', storeName: 'memories', id: m.id });
  });
  letters.forEach(function(l) {
    if (l.photo) allPhotos.push({ src: l.photo, date: formatDateShort(new Date(l.createdAt).toISOString()), title: l.title || '', storeName: 'letters', id: l.id });
  });
  capsules.forEach(function(c) {
    if (c.photo) allPhotos.push({ src: c.photo, date: formatDateShort(new Date(c.createdAt).toISOString()), title: c.title || '', storeName: 'capsules', id: c.id });
  });
  locations.forEach(function(l) {
    if (l.coverPhoto) allPhotos.push({ src: l.coverPhoto, date: '', title: l.name || '', storeName: 'locations', id: l.id });
  });
  characters.forEach(function(c) {
    if (c.photo) allPhotos.push({ src: c.photo, date: '', title: c.name || '', storeName: 'characters', id: c.id });
  });

  var grid = document.getElementById('galleryGrid');
  var empty = document.getElementById('galleryEmpty');

  // Sort photos by date (newest first)
  allPhotos.sort(function(a, b) {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date) - new Date(a.date);
  });

  if (allPhotos.length === 0) { grid.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';

  grid.innerHTML = allPhotos.map(function(p, idx) {
    return '<div class="photo-grid-item" style="aspect-ratio:1">' +
      '<img src="' + escapeHtml(p.src) + '" alt="" onclick="viewFullImageBySrc(\'' + idx + '\')" style="cursor:pointer" />' +
      (p.date ? '<div class="photo-date">' + escapeHtml(p.date) + '</div>' : '') +
      '</div>';
  }).join('');

  // Store for fullscreen viewing
  window._galleryPhotos = allPhotos;
}

async function renderCharacters() {
  var items = await dbGetAll('characters');
  var list = document.getElementById('characterList');
  var empty = document.getElementById('characterEmpty');

  if (items.length === 0) { list.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';

  list.innerHTML = items.map(function(item) {
    var img = item.photo
      ? '<img src="' + escapeHtml(item.photo) + '" class="w-12 h-12 rounded-full object-cover flex-shrink-0" />'
      : '<div class="w-12 h-12 rounded-full bg-blush-100 flex items-center justify-center flex-shrink-0"><i class="fa-solid fa-user text-blush-300"></i></div>';
    return '<div class="character-card" onclick="viewCharacter(\'' + item.id + '\')">' +
      img +
      '<div class="flex-1 min-w-0">' +
      '<p class="font-semibold text-charcoal-800 text-sm truncate">' + escapeHtml(item.name) + '</p>' +
      '<p class="text-xs text-blush-400 truncate">' + escapeHtml(item.role || '') + '</p>' +
      '</div>' +
      '<button class="btn-danger" onclick="event.stopPropagation();deleteItem(\'characters\',\'' + item.id + '\',\'character\')"><i class="fa-solid fa-trash-can"></i></button>' +
      '</div>';
  }).join('');
}

async function renderLocations() {
  var items = await dbGetAll('locations');
  var list = document.getElementById('locationList');
  var empty = document.getElementById('locationEmpty');

  if (items.length === 0) { list.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';

  list.innerHTML = items.map(function(item) {
    var img = item.coverPhoto
      ? '<img src="' + escapeHtml(item.coverPhoto) + '" class="w-full h-28 object-cover" />'
      : '<div class="w-full h-28 bg-sage-100 flex items-center justify-center"><i class="fa-solid fa-map-pin text-sage-300 text-xl"></i></div>';
    return '<div class="location-card">' +
      '<button class="delete-btn-abs" onclick="deleteItem(\'locations\',\'' + item.id + '\',\'location\')"><i class="fa-solid fa-xmark"></i></button>' +
      img +
      '<div class="p-3"><p class="font-semibold text-charcoal-800 text-sm truncate">' + escapeHtml(item.name) + '</p>' +
      (item.history ? '<p class="text-xs text-charcoal-600 mt-1 line-clamp-2">' + escapeHtml(item.history) + '</p>' : '') +
      '</div></div>';
  }).join('');
}

async function renderJokes() {
  var items = await dbGetAll('jokes');
  var list = document.getElementById('jokeList');
  var empty = document.getElementById('jokeEmpty');

  if (items.length === 0) { list.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';

  list.innerHTML = items.map(function(item) {
    return '<div class="joke-card">' +
      '<p class="font-bold text-charcoal-800 text-sm">' + escapeHtml(item.term) + '</p>' +
      (item.definition ? '<p class="text-sm text-charcoal-600 italic mt-1">' + escapeHtml(item.definition) + '</p>' : '') +
      (item.originStory ? '<p class="text-xs text-charcoal-600 mt-2 leading-relaxed">' + escapeHtml(item.originStory) + '</p>' : '') +
      '<div class="joke-card-footer">' +
        '<button class="btn-danger" onclick="deleteItem(\'jokes\',\'' + item.id + '\',\'joke\')"><i class="fa-solid fa-trash-can mr-0.5"></i> Delete</button>' +
      '</div></div>';
  }).join('');
}

async function renderOpenWhen() {
  var items = await dbGetAll('letters');
  var list = document.getElementById('openWhenList');
  var empty = document.getElementById('openWhenEmpty');

  if (items.length === 0) { list.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';

  list.innerHTML = items.map(function(item) {
    var locked = !item.opened;
    var icon = locked ? 'fa-envelope' : 'fa-envelope-open';
    var lockedClass = locked ? 'locked' : '';
    return '<div class="envelope-card ' + lockedClass + '" onclick="' + (locked ? 'openLetter(\'' + item.id + '\')' : 'viewLetter(\'' + item.id + '\')') + '">' +
      '<button class="delete-btn-abs" onclick="event.stopPropagation();deleteItem(\'letters\',\'' + item.id + '\',\'letter\')"><i class="fa-solid fa-xmark"></i></button>' +
      '<i class="fa-solid ' + icon + ' text-blush-300 text-2xl mb-2"></i>' +
      '<div class="envelope-content">' +
      '<p class="font-semibold text-charcoal-800 text-xs mb-1">' + escapeHtml(item.title) + '</p>' +
      (locked ? '<p class="text-[10px] text-charcoal-600">Tap to open</p>' : '<p class="text-[10px] text-sage-400">Opened</p>') +
      '</div></div>';
  }).join('');
}

async function renderCapsules() {
  var items = await dbGetAll('capsules');
  var list = document.getElementById('capsuleList');
  var empty = document.getElementById('capsuleEmpty');

  if (items.length === 0) { list.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';

  list.innerHTML = items.map(function(item) {
    var now = Date.now();
    var unlock = new Date(item.unlockDate).getTime();
    var locked = now < unlock;
    var lockedClass = locked ? 'locked' : '';

    var statusHtml = '';
    if (locked) {
      statusHtml = '<div class="countdown mt-2" id="countdown_' + item.id + '"></div>';
    } else {
      statusHtml = '<p class="text-[10px] text-sage-400 mt-1">Ready to open</p>';
    }

    return '<div class="capsule-card ' + lockedClass + '" data-unlock="' + item.unlockDate + '" data-id="' + item.id + '" onclick="' + (!locked ? 'viewCapsule(\'' + item.id + '\')' : '') + '">' +
      '<button class="delete-btn-abs" onclick="event.stopPropagation();deleteItem(\'capsules\',\'' + item.id + '\',\'capsule\')"><i class="fa-solid fa-xmark"></i></button>' +
      '<i class="fa-solid fa-hourglass-half text-blush-300 text-xl mb-1"></i>' +
      '<div class="capsule-content">' +
      '<p class="font-semibold text-charcoal-800 text-xs">' + escapeHtml(item.title) + '</p>' +
      '</div>' + statusHtml + '</div>';
  }).join('');

  startCountdowns();
}

async function renderFirsts() {
  var items = await dbGetAllSorted('firsts', 'date', false);
  var timeline = document.getElementById('firstsTimeline');
  var empty = document.getElementById('firstsEmpty');

  if (items.length === 0) { timeline.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';

  timeline.innerHTML = items.map(function(item) {
    return '<div class="first-card">' +
      '<div class="flex justify-between items-start">' +
        '<div>' +
          '<p class="text-xs text-blush-400 font-medium">' + escapeHtml(formatDateShort(item.date)) + '</p>' +
          '<p class="font-bold text-charcoal-800 text-sm">' + escapeHtml(item.title) + '</p>' +
          (item.description ? '<p class="text-xs text-charcoal-600 mt-0.5">' + escapeHtml(item.description) + '</p>' : '') +
        '</div>' +
        '<button class="btn-danger" onclick="deleteItem(\'firsts\',\'' + item.id + '\',\'milestone\')"><i class="fa-solid fa-trash-can"></i></button>' +
      '</div></div>';
  }).join('');
}

async function renderFightLog() {
  var items = await dbGetAllSorted('fightlog', 'createdAt', true);
  var list = document.getElementById('fightLogList');

  if (items.length === 0) { list.innerHTML = ''; return; }

  list.innerHTML = items.map(function(item) {
    return '<div class="fight-card">' +
      '<button class="delete-btn-abs" onclick="deleteItem(\'fightlog\',\'' + item.id + '\',\'entry\')"><i class="fa-solid fa-xmark"></i></button>' +
      '<p class="text-xs text-sage-400 font-medium mb-1">' + escapeHtml(formatDateShort(new Date(item.createdAt).toISOString())) + '</p>' +
      '<p class="text-sm text-charcoal-800"><span class="font-semibold">What:</span> ' + escapeHtml(item.whatHappened) + '</p>' +
      (item.howResolved ? '<p class="text-sm text-charcoal-600 mt-1"><span class="font-semibold">Resolved:</span> ' + escapeHtml(item.howResolved) + '</p>' : '') +
      (item.lessonLearned ? '<p class="text-sm text-charcoal-600 mt-1 italic"><span class="font-semibold not-italic">Lesson:</span> ' + escapeHtml(item.lessonLearned) + '</p>' : '') +
      '</div>';
  }).join('');
}

async function renderBucketList() {
  var items = await dbGetAll('bucketlist');
  var activeList = document.getElementById('bucketListActive');
  var completedList = document.getElementById('bucketListCompleted');

  var active = items.filter(function(i) { return !i.completed; });
  var completed = items.filter(function(i) { return i.completed; });

  activeList.innerHTML = active.map(function(item) {
    return '<div class="bucket-item">' +
      '<div class="bucket-check" onclick="toggleBucket(\'' + item.id + '\')"></div>' +
      '<div class="flex-1 min-w-0">' +
      '<p class="bucket-title font-semibold text-charcoal-800 text-sm">' + escapeHtml(item.title) + '</p>' +
      (item.details ? '<p class="text-xs text-charcoal-600">' + escapeHtml(item.details) + '</p>' : '') +
      '</div>' +
      '<button class="btn-danger" onclick="deleteItem(\'bucketlist\',\'' + item.id + '\',\'item\')"><i class="fa-solid fa-trash-can"></i></button>' +
      '</div>';
  }).join('');

  completedList.innerHTML = completed.map(function(item) {
    return '<div class="bucket-item completed">' +
      '<div class="bucket-check checked" onclick="toggleBucket(\'' + item.id + '\')"><i class="fa-solid fa-check text-[10px]"></i></div>' +
      '<div class="flex-1 min-w-0">' +
      '<p class="bucket-title font-semibold text-charcoal-800 text-sm">' + escapeHtml(item.title) + '</p>' +
      (item.details ? '<p class="text-xs text-charcoal-600">' + escapeHtml(item.details) + '</p>' : '') +
      '</div>' +
      '<button class="btn-danger" onclick="deleteItem(\'bucketlist\',\'' + item.id + '\',\'item\')"><i class="fa-solid fa-trash-can"></i></button>' +
      '</div>';
  }).join('');
}

// ---- Photo Grid (old modal, still used by settings) ----

async function renderPhotoGrid() {
  var memories = await dbGetAll('memories');
  var letters = await dbGetAll('letters');
  var capsules = await dbGetAll('capsules');
  var locations = await dbGetAll('locations');
  var characters = await dbGetAll('characters');

  var allPhotos = [];

  memories.forEach(function(m) {
    if (m.photo) allPhotos.push({ src: m.photo, date: m.date || '', title: m.title || '' });
  });
  letters.forEach(function(l) {
    if (l.photo) allPhotos.push({ src: l.photo, date: formatDateShort(new Date(l.createdAt).toISOString()), title: l.title || '' });
  });
  capsules.forEach(function(c) {
    if (c.photo) allPhotos.push({ src: c.photo, date: formatDateShort(new Date(c.createdAt).toISOString()), title: c.title || '' });
  });
  locations.forEach(function(l) {
    if (l.coverPhoto) allPhotos.push({ src: l.coverPhoto, date: '', title: l.name || '' });
  });
  characters.forEach(function(c) {
    if (c.photo) allPhotos.push({ src: c.photo, date: '', title: c.name || '' });
  });

  var grid = document.getElementById('photoGridContent');
  var empty = document.getElementById('photoGridEmpty');

  if (allPhotos.length === 0) { grid.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';

  grid.innerHTML = allPhotos.map(function(p) {
    return '<div class="photo-grid-item"><img src="' + escapeHtml(p.src) + '" alt="" />' +
      (p.date ? '<div class="photo-date">' + escapeHtml(p.date) + '</div>' : '') +
      '</div>';
  }).join('');
}

// ============================================
// INTERACTIVE ACTIONS
// ============================================

// View full image from timeline
async function viewFullImage(memoryId) {
  var item = await dbGet('memories', memoryId);
  if (item && item.photo) {
    showFullImageViewer(item.photo);
  }
}

// View full image from gallery
function viewFullImageBySrc(idx) {
  if (window._galleryPhotos && window._galleryPhotos[idx]) {
    showFullImageViewer(window._galleryPhotos[idx].src);
  }
}

function showFullImageViewer(src) {
  var viewer = document.createElement('div');
  viewer.style.cssText = 'position:fixed;inset:0;z-index:60;background:rgba(0,0,0,0.95);display:flex;align-items:center;justify-content:center;cursor:pointer';
  viewer.onclick = function() { document.body.removeChild(viewer); };
  viewer.innerHTML = '<img src="' + escapeHtml(src) + '" style="max-width:100%;max-height:100%;object-fit:contain;padding:1rem" /><button style="position:absolute;top:1rem;right:1rem;color:rgba(255,255,255,0.7);font-size:1.5rem;background:none;border:none;cursor:pointer"><i class="fa-solid fa-xmark"></i></button>';
  document.body.appendChild(viewer);
}

async function openLetter(id) {
  var item = await dbGet('letters', id);
  if (!item) return;
  if (confirm('Are you ready to open "' + item.title + '"? You can only do this once.')) {
    item.opened = true;
    item.updatedAt = Date.now();
    await saveAndQueue('letters', item);
    viewLetter(id);
    renderOpenWhen();
  }
}

async function viewLetter(id) {
  var item = await dbGet('letters', id);
  if (!item) return;
  var html = '<p class="text-sm text-charcoal-700 leading-relaxed mb-3">' + escapeHtml(item.body) + '</p>';
  if (item.photo) html += '<img src="' + escapeHtml(item.photo) + '" alt="" class="w-full rounded-xl" />';
  showModal('modalCharDetail');
  document.getElementById('charDetailName').textContent = item.title;
  document.getElementById('charDetailImg').style.display = 'none';
  document.getElementById('charDetailRole').textContent = 'A letter for you';
  document.getElementById('charDetailBio').innerHTML = html;
  document.getElementById('charDetailEvents').innerHTML = '';
}

async function viewCapsule(id) {
  var item = await dbGet('capsules', id);
  if (!item) return;
  var html = '<p class="text-sm text-charcoal-700 leading-relaxed mb-3">' + escapeHtml(item.body) + '</p>';
  if (item.photo) html += '<img src="' + escapeHtml(item.photo) + '" alt="" class="w-full rounded-xl" />';
  showModal('modalCharDetail');
  document.getElementById('charDetailName').textContent = item.title;
  document.getElementById('charDetailImg').style.display = 'none';
  document.getElementById('charDetailRole').textContent = 'Time Capsule';
  document.getElementById('charDetailBio').innerHTML = html;
  document.getElementById('charDetailEvents').innerHTML = '';
}

async function viewCharacter(id) {
  var item = await dbGet('characters', id);
  if (!item) return;

  if (item.photo) {
    document.getElementById('charDetailImg').src = item.photo;
    document.getElementById('charDetailImg').style.display = 'block';
  } else {
    document.getElementById('charDetailImg').style.display = 'none';
  }
  document.getElementById('charDetailName').textContent = item.name;
  document.getElementById('charDetailRole').textContent = item.role || '';
  document.getElementById('charDetailBio').textContent = item.bio || '';

  var memories = await dbGetAll('memories');
  var tags = (item.tags || '').split(',').map(function(t) { return t.trim().toLowerCase(); }).filter(Boolean);
  var related = memories.filter(function(m) {
    var mText = ((m.title || '') + ' ' + (m.description || '')).toLowerCase();
    return tags.some(function(tag) { return mText.includes(tag); });
  });

  var eventsDiv = document.getElementById('charDetailEvents');
  if (related.length === 0) {
    eventsDiv.innerHTML = '<p class="text-xs text-charcoal-600">No linked memories yet</p>';
  } else {
    eventsDiv.innerHTML = related.map(function(m) {
      return '<div class="p-2 bg-cream-50 rounded-lg">' +
        '<p class="text-xs font-semibold text-charcoal-800">' + escapeHtml(m.title) + '</p>' +
        '<p class="text-[10px] text-charcoal-600">' + escapeHtml(formatDateShort(m.date)) + '</p>' +
        '</div>';
    }).join('');
  }
  showModal('modalCharDetail');
}

async function toggleBucket(id) {
  var item = await dbGet('bucketlist', id);
  if (!item) return;
  item.completed = !item.completed;
  item.updatedAt = Date.now();
  await saveAndQueue('bucketlist', item);
  renderBucketList();
}

// ---- Audio Player ----

function toggleAudio(audioId, btn) {
  var audio = document.getElementById(audioId);
  if (!audio) return;
  if (audio.paused) {
    audio.play();
    btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    audio.onended = function() { btn.innerHTML = '<i class="fa-solid fa-play"></i>'; };
  } else {
    audio.pause();
    btn.innerHTML = '<i class="fa-solid fa-play"></i>';
  }
}

// ---- Countdowns ----

function startCountdowns() {
  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = setInterval(function() {
    document.querySelectorAll('.capsule-card[data-unlock]').forEach(function(card) {
      var unlockDate = card.dataset.unlock;
      var cd = getCountdown(unlockDate);
      var cdEl = card.querySelector('.countdown');
      if (cd.done) {
        card.classList.remove('locked');
        if (cdEl) cdEl.innerHTML = '<p class="text-[10px] text-sage-400">Ready!</p>';
      } else if (cdEl) {
        cdEl.innerHTML =
          '<div class="countdown-unit"><span class="num">' + cd.days + '</span><span class="lbl">d</span></div>' +
          '<div class="countdown-unit"><span class="num">' + cd.hours + '</span><span class="lbl">h</span></div>' +
          '<div class="countdown-unit"><span class="num">' + cd.minutes + '</span><span class="lbl">m</span></div>' +
          '<div class="countdown-unit"><span class="num">' + cd.seconds + '</span><span class="lbl">s</span></div>';
      }
    });
  }, 1000);
}

// ---- Nerd Stats ----

async function updateNerdStats() {
  var startDate = getStartDate();
  var daysEl = document.getElementById('statDays');
  var memEl = document.getElementById('statMemories');
  var photoEl = document.getElementById('statPhotos');

  if (startDate) daysEl.textContent = daysBetween(startDate);

  var memories = await dbGetAll('memories');
  // Count only actual memories, not gallery-only photos
  var realMemories = memories.filter(function(m) { return m.type !== 'gallery_photo'; });
  memEl.textContent = realMemories.length;

  var photoCount = 0;
  memories.forEach(function(m) { if (m.photo) photoCount++; });
  var letters = await dbGetAll('letters');
  letters.forEach(function(l) { if (l.photo) photoCount++; });
  var capsules = await dbGetAll('capsules');
  capsules.forEach(function(c) { if (c.photo) photoCount++; });
  var locations = await dbGetAll('locations');
  locations.forEach(function(l) { if (l.coverPhoto) photoCount++; });
  var characters = await dbGetAll('characters');
  characters.forEach(function(c) { if (c.photo) photoCount++; });
  photoEl.textContent = photoCount;
}

// ---- Settings: Save Start Date ----

document.addEventListener('change', async function(e) {
  if (e.target.id === 'startDateInput') {
    setStartDate(e.target.value);
    updateNerdStats();
  }
});

// ---- Override Photo Gallery modal open to render first ----

var _origShowModal = showModal;
showModal = function(id) {
  if (id === 'modalPhotoGrid') renderPhotoGrid();
  if (id === 'modalGalleryUpload') document.getElementById('galleryPhotoDate').value = todayStr();
  _origShowModal(id);
};

// ============================================
// APP INITIALIZATION
// ============================================

async function initApp() {
  var startDate = getStartDate();
  if (startDate) document.getElementById('startDateInput').value = startDate;
  document.getElementById('memoryDate').value = todayStr();
  navigate('home');
  startSyncEngine();
  if (navigator.onLine) await signInAnonymously();
  updateNerdStats();
}

window.addEventListener('DOMContentLoaded', function() {
  if (hasPin()) {
    document.getElementById('pinEnterBtn').classList.remove('hidden');
    document.getElementById('setPinBtn').classList.add('hidden');
  } else {
    document.getElementById('pinEnterBtn').classList.add('hidden');
    document.getElementById('setPinBtn').classList.add('hidden');
  }

  // Pre-set anniversary date (May 29, 2026 at 1:04 AM)
  if (!getStartDate()) {
    setStartDate('2026-05-29');
  }
});
