/* ============================================ */
/* LoveLore — Main Application Logic            */
/* ============================================ */

// ---- State ----

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
  if (hasPin()) {
    document.getElementById('pinEnterBtn').classList.remove('hidden');
  }
}

function updatePinDisplay() {
  const chars = document.querySelectorAll('.pin-char');
  chars.forEach((el, i) => {
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
  const stored = getStoredPin();
  if (currentPin === stored) {
    unlockSuccess();
  } else {
    const display = document.getElementById('pinDisplay');
    display.classList.add('shake');
    document.getElementById('pinError').textContent = 'Wrong PIN. Try again.';
    currentPin = '';
    updatePinDisplay();
    setTimeout(() => display.classList.remove('shake'), 500);
  }
}

function setFirstPin() {
  if (currentPin.length !== 4) return;
  setStoredPin(currentPin);
  unlockSuccess();
}

function changePin() {
  const newPin = document.getElementById('newPinInput').value;
  if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
    alert('PIN must be exactly 4 digits');
    return;
  }
  setStoredPin(newPin);
  document.getElementById('newPinInput').value = '';
  alert('PIN updated!');
}

function unlockSuccess() {
  const lock = document.getElementById('lockScreen');
  lock.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  lock.style.opacity = '0';
  lock.style.transform = 'scale(1.05)';

  setTimeout(() => {
    lock.style.display = 'none';
    document.getElementById('partnerSelect').style.display = 'flex';
  }, 500);
}

// ---- Partner Selection ----

function selectPartner(num) {
  setActivePartner(num);
  const badge = document.getElementById('activePartner');
  badge.textContent = 'P' + num;

  const ps = document.getElementById('partnerSelect');
  ps.style.transition = 'opacity 0.4s ease';
  ps.style.opacity = '0';

  setTimeout(() => {
    ps.style.display = 'none';
    document.getElementById('appShell').style.display = 'flex';
    document.getElementById('appShell').style.opacity = '0';
    document.getElementById('appShell').style.transition = 'opacity 0.4s ease';
    setTimeout(() => { document.getElementById('appShell').style.opacity = '1'; }, 50);
    initApp();
  }, 400);
}

// ---- Lock App ----

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
  document.querySelectorAll('.screen').forEach((el) => {
    el.style.display = 'none';
  });
  const target = document.getElementById('screen' + screen.charAt(0).toUpperCase() + screen.slice(1));
  if (target) {
    target.style.display = 'block';
    target.classList.remove('page-enter');
    void target.offsetWidth;
    target.classList.add('page-enter');
  }
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.screen === screen);
  });
  refreshCurrentScreen();
  document.getElementById('mainContent').scrollTop = 0;
}

function refreshCurrentScreen() {
  switch (currentScreen) {
    case 'home': renderTimeline(); updateNerdStats(); break;
    case 'wiki': renderCharacters(); renderLocations(); renderJokes(); break;
    case 'letters': renderOpenWhen(); renderCapsules(); renderFirsts(); startCountdowns(); break;
    case 'settings': renderFightLog(); renderBucketList(); break;
  }
}

// ---- Wiki Tabs ----

function showWikiTab(tab) {
  document.querySelectorAll('.wiki-content').forEach((el) => { el.style.display = 'none'; });
  document.querySelectorAll('.wiki-tab, .tab-bar .tab-btn').forEach((btn) => {
    if (btn.dataset && btn.dataset.tab) {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    }
  });
  const target = document.getElementById('wiki' + tab.charAt(0).toUpperCase() + tab.slice(1));
  if (target) target.style.display = 'block';
}

// ---- Letter Tabs ----

function showLetterTab(tab) {
  document.querySelectorAll('.letter-content').forEach((el) => { el.style.display = 'none'; });
  document.querySelectorAll('.letter-tab, .tab-bar .tab-btn').forEach((btn) => {
    if (btn.dataset && btn.dataset.tab) {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    }
  });
  if (tab === 'openwhen') document.getElementById('letterOpenWhen').style.display = 'block';
  else if (tab === 'capsules') document.getElementById('letterCapsules').style.display = 'block';
  else if (tab === 'firsts') document.getElementById('letterFirsts').style.display = 'block';

  if (tab === 'capsules') startCountdowns();
}

// ---- Add Menu ----

function showAddMenu() {
  const menu = document.getElementById('addMenu');
  menu.style.display = 'block';
  setTimeout(() => {
    document.getElementById('addMenuPanel').style.transform = 'translateY(0)';
  }, 10);
}

function hideAddMenu() {
  document.getElementById('addMenuPanel').style.transform = 'translateY(100%)';
  setTimeout(() => {
    document.getElementById('addMenu').style.display = 'none';
  }, 500);
}

// ---- Modals ----

function showModal(id) {
  document.getElementById(id).style.display = 'flex';
}

function hideModal(id) {
  document.getElementById(id).style.display = 'none';
}

// ============================================
// SAVE FUNCTIONS
// ============================================

async function saveMemory() {
  const dateVal = document.getElementById('memoryDate').value || todayStr();
  const title = document.getElementById('memoryTitle').value.trim();
  const desc = document.getElementById('memoryDesc').value.trim();
  const photoFile = document.getElementById('memoryPhoto').files[0];
  const audioFile = document.getElementById('memoryAudio').files[0];

  if (!title) { alert('Please add a title'); return; }

  let photoData = '';
  if (photoFile) {
    photoData = await compressImage(photoFile);
  }

  let audioData = '';
  if (audioFile) {
    audioData = await fileToBase64(audioFile);
  }

  const id = generateId();
  const item = {
    id, type: 'memory', date: dateVal,
    title, description: desc,
    photo: photoData, audio: audioData,
    audioName: audioFile ? audioFile.name : '',
    partner: getActivePartner(),
    createdAt: Date.now(), updatedAt: Date.now(), _new: true
  };

  await saveAndQueue('memories', item);
  hideModal('modalTimeline');
  clearModal('modalTimeline');
  renderTimeline();
  updateNerdStats();
}

async function saveCharacter() {
  const name = document.getElementById('charName').value.trim();
  const role = document.getElementById('charRole').value.trim();
  const bio = document.getElementById('charBio').value.trim();
  const photoFile = document.getElementById('charPhoto').files[0];
  const tags = document.getElementById('charTags').value.trim();

  if (!name) { alert('Please add a name'); return; }

  let photoData = '';
  if (photoFile) photoData = await compressImage(photoFile);

  const id = generateId();
  const item = {
    id, type: 'character', name, role, bio,
    photo: photoData, tags,
    partner: getActivePartner(),
    createdAt: Date.now(), updatedAt: Date.now(), _new: true
  };

  await saveAndQueue('characters', item);
  hideModal('modalCharacter');
  clearModal('modalCharacter');
  renderCharacters();
}

async function saveLocation() {
  const name = document.getElementById('locName').value.trim();
  const history = document.getElementById('locHistory').value.trim();
  const photoFile = document.getElementById('locPhoto').files[0];

  if (!name) { alert('Please add a location name'); return; }

  let photoData = '';
  if (photoFile) photoData = await compressImage(photoFile);

  const id = generateId();
  const item = {
    id, type: 'location', name, history,
    coverPhoto: photoData,
    partner: getActivePartner(),
    createdAt: Date.now(), updatedAt: Date.now(), _new: true
  };

  await saveAndQueue('locations', item);
  hideModal('modalLocation');
  clearModal('modalLocation');
  renderLocations();
}

async function saveJoke() {
  const term = document.getElementById('jokeTerm').value.trim();
  const definition = document.getElementById('jokeDef').value.trim();
  const originStory = document.getElementById('jokeOrigin').value.trim();

  if (!term) { alert('Please add the term'); return; }

  const id = generateId();
  const item = {
    id, type: 'joke', term, definition, originStory,
    partner: getActivePartner(),
    createdAt: Date.now(), updatedAt: Date.now(), _new: true
  };

  await saveAndQueue('jokes', item);
  hideModal('modalJoke');
  clearModal('modalJoke');
  renderJokes();
}

async function saveOpenWhen() {
  const title = document.getElementById('letterTitle').value.trim();
  const body = document.getElementById('letterBody').value.trim();
  const photoFile = document.getElementById('letterPhoto').files[0];

  if (!title || !body) { alert('Please add title and letter body'); return; }

  let photoData = '';
  if (photoFile) photoData = await compressImage(photoFile);

  const id = generateId();
  const item = {
    id, type: 'openwhen', title, body,
    photo: photoData, opened: false,
    partner: getActivePartner(),
    createdAt: Date.now(), updatedAt: Date.now(), _new: true
  };

  await saveAndQueue('letters', item);
  hideModal('modalOpenWhen');
  clearModal('modalOpenWhen');
  renderOpenWhen();
}

async function saveCapsule() {
  const title = document.getElementById('capsuleTitle').value.trim();
  const body = document.getElementById('capsuleBody').value.trim();
  const unlockDate = document.getElementById('capsuleDate').value;
  const photoFile = document.getElementById('capsulePhoto').files[0];

  if (!title || !body || !unlockDate) { alert('Please fill all fields'); return; }

  let photoData = '';
  if (photoFile) photoData = await compressImage(photoFile);

  const id = generateId();
  const item = {
    id, type: 'capsule', title, body,
    photo: photoData, unlockDate,
    opened: false,
    partner: getActivePartner(),
    createdAt: Date.now(), updatedAt: Date.now(), _new: true
  };

  await saveAndQueue('capsules', item);
  hideModal('modalCapsule');
  clearModal('modalCapsule');
  renderCapsules();
}

async function saveFirst() {
  const date = document.getElementById('firstDate').value || todayStr();
  const title = document.getElementById('firstTitle').value.trim();
  const desc = document.getElementById('firstDesc').value.trim();

  if (!title) { alert('Please add a title'); return; }

  const id = generateId();
  const item = {
    id, type: 'first', date, title,
    description: desc,
    partner: getActivePartner(),
    createdAt: Date.now(), updatedAt: Date.now(), _new: true
  };

  await saveAndQueue('firsts', item);
  hideModal('modalFirst');
  clearModal('modalFirst');
  renderFirsts();
}

async function saveFightLog() {
  const whatHappened = document.getElementById('fightWhat').value.trim();
  const howResolved = document.getElementById('fightResolved').value.trim();
  const lessonLearned = document.getElementById('fightLesson').value.trim();

  if (!whatHappened) { alert('Please describe what happened'); return; }

  const id = generateId();
  const item = {
    id, type: 'fightlog', whatHappened, howResolved, lessonLearned,
    partner: getActivePartner(),
    createdAt: Date.now(), updatedAt: Date.now(), _new: true
  };

  await saveAndQueue('fightlog', item);
  hideModal('modalFightLog');
  clearModal('modalFightLog');
  renderFightLog();
}

async function saveBucketItem() {
  const title = document.getElementById('bucketTitle').value.trim();
  const details = document.getElementById('bucketDetails').value.trim();

  if (!title) { alert('Please add an item'); return; }

  const id = generateId();
  const item = {
    id, type: 'bucket', title, details,
    completed: false,
    partner: getActivePartner(),
    createdAt: Date.now(), updatedAt: Date.now(), _new: true
  };

  await saveAndQueue('bucketlist', item);
  hideModal('modalBucketList');
  clearModal('modalBucketList');
  renderBucketList();
}

// ---- Clear modal fields after save ----

function clearModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.querySelectorAll('input[type="text"], input[type="password"], input[type="date"], input[type="datetime-local"], textarea').forEach((el) => { el.value = ''; });
  modal.querySelectorAll('input[type="file"]').forEach((el) => { el.value = ''; });
}

// ============================================
// RENDER FUNCTIONS
// ============================================

async function renderTimeline() {
  const items = await dbGetAllSorted('memories', 'date', true);
  const feed = document.getElementById('timelineFeed');
  const empty = document.getElementById('timelineEmpty');

  if (items.length === 0) {
    feed.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  feed.innerHTML = items.map((item) => {
    let photoHtml = '';
    if (item.photo) {
      photoHtml = '<img src="' + escapeHtml(item.photo) + '" alt="" class="w-full rounded-xl mt-2 object-cover max-h-48" />';
    }
    let audioHtml = '';
    if (item.audio) {
      const audioId = 'audio_' + item.id;
      audioHtml = '<div class="audio-player mt-2">' +
        '<button onclick="toggleAudio(\'' + audioId + '\', this)"><i class="fa-solid fa-play"></i></button>' +
        '<span>' + escapeHtml(item.audioName || 'Voice memo') + '</span>' +
        '<audio id="' + audioId + '" src="' + escapeHtml(item.audio) + '" preload="none"></audio>' +
        '</div>';
    }
    return '<div class="timeline-card">' +
      '<p class="text-xs text-blush-400 font-medium mb-1">' + escapeHtml(formatDateShort(item.date)) + '</p>' +
      '<h3 class="text-base font-bold text-charcoal-800 mb-1">' + escapeHtml(item.title) + '</h3>' +
      (item.description ? '<p class="text-sm text-charcoal-600 leading-relaxed">' + escapeHtml(item.description) + '</p>' : '') +
      photoHtml + audioHtml +
      '</div>';
  }).join('');
}

async function renderCharacters() {
  const items = await dbGetAll('characters');
  const list = document.getElementById('characterList');
  const empty = document.getElementById('characterEmpty');

  if (items.length === 0) { list.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';

  list.innerHTML = items.map((item) => {
    const img = item.photo
      ? '<img src="' + escapeHtml(item.photo) + '" class="w-12 h-12 rounded-full object-cover flex-shrink-0" />'
      : '<div class="w-12 h-12 rounded-full bg-blush-100 flex items-center justify-center flex-shrink-0"><i class="fa-solid fa-user text-blush-300"></i></div>';
    return '<div class="character-card" onclick="viewCharacter(\'' + item.id + '\')">' +
      img +
      '<div class="flex-1 min-w-0">' +
      '<p class="font-semibold text-charcoal-800 text-sm truncate">' + escapeHtml(item.name) + '</p>' +
      '<p class="text-xs text-blush-400 truncate">' + escapeHtml(item.role || '') + '</p>' +
      '</div></div>';
  }).join('');
}

async function renderLocations() {
  const items = await dbGetAll('locations');
  const list = document.getElementById('locationList');
  const empty = document.getElementById('locationEmpty');

  if (items.length === 0) { list.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';

  list.innerHTML = items.map((item) => {
    const img = item.coverPhoto
      ? '<img src="' + escapeHtml(item.coverPhoto) + '" class="w-full h-28 object-cover" />'
      : '<div class="w-full h-28 bg-sage-100 flex items-center justify-center"><i class="fa-solid fa-map-pin text-sage-300 text-xl"></i></div>';
    return '<div class="location-card">' + img +
      '<div class="p-3"><p class="font-semibold text-charcoal-800 text-sm truncate">' + escapeHtml(item.name) + '</p>' +
      (item.history ? '<p class="text-xs text-charcoal-600 mt-1 line-clamp-2">' + escapeHtml(item.history) + '</p>' : '') +
      '</div></div>';
  }).join('');
}

async function renderJokes() {
  const items = await dbGetAll('jokes');
  const list = document.getElementById('jokeList');
  const empty = document.getElementById('jokeEmpty');

  if (items.length === 0) { list.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';

  list.innerHTML = items.map((item) => {
    return '<div class="joke-card">' +
      '<p class="font-bold text-charcoal-800 text-sm">' + escapeHtml(item.term) + '</p>' +
      (item.definition ? '<p class="text-sm text-charcoal-600 italic mt-1">' + escapeHtml(item.definition) + '</p>' : '') +
      (item.originStory ? '<p class="text-xs text-charcoal-600 mt-2 leading-relaxed">' + escapeHtml(item.originStory) + '</p>' : '') +
      '</div>';
  }).join('');
}

async function renderOpenWhen() {
  const items = await dbGetAll('letters');
  const list = document.getElementById('openWhenList');
  const empty = document.getElementById('openWhenEmpty');

  if (items.length === 0) { list.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';

  list.innerHTML = items.map((item) => {
    const locked = !item.opened;
    const icon = locked ? 'fa-envelope' : 'fa-envelope-open';
    const lockedClass = locked ? 'locked' : '';
    return '<div class="envelope-card ' + lockedClass + '" onclick="' + (locked ? 'openLetter(\'' + item.id + '\')' : 'viewLetter(\'' + item.id + '\')') + '">' +
      '<i class="fa-solid ' + icon + ' text-blush-300 text-2xl mb-2"></i>' +
      '<div class="envelope-content">' +
      '<p class="font-semibold text-charcoal-800 text-xs mb-1">' + escapeHtml(item.title) + '</p>' +
      (locked ? '<p class="text-[10px] text-charcoal-600">Tap to open</p>' : '<p class="text-[10px] text-sage-400">Opened</p>') +
      '</div></div>';
  }).join('');
}

async function renderCapsules() {
  const items = await dbGetAll('capsules');
  const list = document.getElementById('capsuleList');
  const empty = document.getElementById('capsuleEmpty');

  if (items.length === 0) { list.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';

  list.innerHTML = items.map((item) => {
    const now = Date.now();
    const unlock = new Date(item.unlockDate).getTime();
    const locked = now < unlock;
    const lockedClass = locked ? 'locked' : '';

    let statusHtml = '';
    if (locked) {
      statusHtml = '<div class="countdown mt-2" id="countdown_' + item.id + '"></div>';
    } else {
      statusHtml = '<p class="text-[10px] text-sage-400 mt-1">Ready to open</p>';
    }

    return '<div class="capsule-card ' + lockedClass + '" data-unlock="' + item.unlockDate + '" data-id="' + item.id + '" onclick="' + (!locked ? 'viewCapsule(\'' + item.id + '\')' : '') + '">' +
      '<i class="fa-solid fa-hourglass-half text-blush-300 text-xl mb-1"></i>' +
      '<div class="capsule-content">' +
      '<p class="font-semibold text-charcoal-800 text-xs">' + escapeHtml(item.title) + '</p>' +
      '</div>' +
      statusHtml +
      '</div>';
  }).join('');

  startCountdowns();
}

async function renderFirsts() {
  const items = await dbGetAllSorted('firsts', 'date', false);
  const timeline = document.getElementById('firstsTimeline');
  const empty = document.getElementById('firstsEmpty');

  if (items.length === 0) { timeline.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';

  timeline.innerHTML = items.map((item) => {
    return '<div class="first-card">' +
      '<p class="text-xs text-blush-400 font-medium">' + escapeHtml(formatDateShort(item.date)) + '</p>' +
      '<p class="font-bold text-charcoal-800 text-sm">' + escapeHtml(item.title) + '</p>' +
      (item.description ? '<p class="text-xs text-charcoal-600 mt-0.5">' + escapeHtml(item.description) + '</p>' : '') +
      '</div>';
  }).join('');
}

async function renderFightLog() {
  const items = await dbGetAllSorted('fightlog', 'createdAt', true);
  const list = document.getElementById('fightLogList');

  if (items.length === 0) { list.innerHTML = ''; return; }

  list.innerHTML = items.map((item) => {
    return '<div class="fight-card">' +
      '<p class="text-xs text-sage-400 font-medium mb-1">' + escapeHtml(formatDateShort(new Date(item.createdAt).toISOString())) + '</p>' +
      '<p class="text-sm text-charcoal-800"><span class="font-semibold">What:</span> ' + escapeHtml(item.whatHappened) + '</p>' +
      (item.howResolved ? '<p class="text-sm text-charcoal-600 mt-1"><span class="font-semibold">Resolved:</span> ' + escapeHtml(item.howResolved) + '</p>' : '') +
      (item.lessonLearned ? '<p class="text-sm text-charcoal-600 mt-1 italic"><span class="font-semibold not-italic">Lesson:</span> ' + escapeHtml(item.lessonLearned) + '</p>' : '') +
      '</div>';
  }).join('');
}

async function renderBucketList() {
  const items = await dbGetAll('bucketlist');
  const activeList = document.getElementById('bucketListActive');
  const completedList = document.getElementById('bucketListCompleted');

  const active = items.filter((i) => !i.completed);
  const completed = items.filter((i) => i.completed);

  activeList.innerHTML = active.map((item) => {
    return '<div class="bucket-item">' +
      '<div class="bucket-check" onclick="toggleBucket(\'' + item.id + '\')"></div>' +
      '<div class="flex-1 min-w-0">' +
      '<p class="bucket-title font-semibold text-charcoal-800 text-sm">' + escapeHtml(item.title) + '</p>' +
      (item.details ? '<p class="text-xs text-charcoal-600">' + escapeHtml(item.details) + '</p>' : '') +
      '</div></div>';
  }).join('');

  completedList.innerHTML = completed.map((item) => {
    return '<div class="bucket-item completed">' +
      '<div class="bucket-check checked" onclick="toggleBucket(\'' + item.id + '\')"><i class="fa-solid fa-check text-[10px]"></i></div>' +
      '<div class="flex-1 min-w-0">' +
      '<p class="bucket-title font-semibold text-charcoal-800 text-sm">' + escapeHtml(item.title) + '</p>' +
      (item.details ? '<p class="text-xs text-charcoal-600">' + escapeHtml(item.details) + '</p>' : '') +
      '</div></div>';
  }).join('');
}

// ---- Photo Grid ----

async function renderPhotoGrid() {
  const memories = await dbGetAll('memories');
  const letters = await dbGetAll('letters');
  const capsules = await dbGetAll('capsules');
  const locations = await dbGetAll('locations');
  const characters = await dbGetAll('characters');

  const allPhotos = [];

  memories.forEach((m) => { if (m.photo) allPhotos.push(m.photo); });
  letters.forEach((l) => { if (l.photo) allPhotos.push(l.photo); });
  capsules.forEach((c) => { if (c.photo) allPhotos.push(c.photo); });
  locations.forEach((l) => { if (l.coverPhoto) allPhotos.push(l.coverPhoto); });
  characters.forEach((c) => { if (c.photo) allPhotos.push(c.photo); });

  const grid = document.getElementById('photoGridContent');
  const empty = document.getElementById('photoGridEmpty');

  if (allPhotos.length === 0) { grid.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';

  grid.innerHTML = allPhotos.map((src) => {
    return '<div class="photo-grid-item"><img src="' + escapeHtml(src) + '" alt="" /></div>';
  }).join('');
}

// ============================================
// INTERACTIVE ACTIONS
// ============================================

async function openLetter(id) {
  const item = await dbGet('letters', id);
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
  const item = await dbGet('letters', id);
  if (!item) return;
  let html = '<p class="text-sm text-charcoal-700 leading-relaxed mb-3">' + escapeHtml(item.body) + '</p>';
  if (item.photo) {
    html += '<img src="' + escapeHtml(item.photo) + '" alt="" class="w-full rounded-xl" />';
  }
  showModal('modalCharDetail');
  document.getElementById('charDetailName').textContent = item.title;
  document.getElementById('charDetailImg').style.display = 'none';
  document.getElementById('charDetailRole').textContent = 'From Partner ' + (item.partner || '1');
  document.getElementById('charDetailBio').innerHTML = html;
  document.getElementById('charDetailEvents').innerHTML = '';
}

async function viewCapsule(id) {
  const item = await dbGet('capsules', id);
  if (!item) return;
  let html = '<p class="text-sm text-charcoal-700 leading-relaxed mb-3">' + escapeHtml(item.body) + '</p>';
  if (item.photo) {
    html += '<img src="' + escapeHtml(item.photo) + '" alt="" class="w-full rounded-xl" />';
  }
  showModal('modalCharDetail');
  document.getElementById('charDetailName').textContent = item.title;
  document.getElementById('charDetailImg').style.display = 'none';
  document.getElementById('charDetailRole').textContent = 'Time Capsule';
  document.getElementById('charDetailBio').innerHTML = html;
  document.getElementById('charDetailEvents').innerHTML = '';
}

async function viewCharacter(id) {
  const item = await dbGet('characters', id);
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

  // Find related memories by tags
  const memories = await dbGetAll('memories');
  const tags = (item.tags || '').split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
  const related = memories.filter((m) => {
    const mText = ((m.title || '') + ' ' + (m.description || '')).toLowerCase();
    return tags.some((tag) => mText.includes(tag));
  });

  const eventsDiv = document.getElementById('charDetailEvents');
  if (related.length === 0) {
    eventsDiv.innerHTML = '<p class="text-xs text-charcoal-600">No linked memories yet</p>';
  } else {
    eventsDiv.innerHTML = related.map((m) => {
      return '<div class="p-2 bg-cream-50 rounded-lg">' +
        '<p class="text-xs font-semibold text-charcoal-800">' + escapeHtml(m.title) + '</p>' +
        '<p class="text-[10px] text-charcoal-600">' + escapeHtml(formatDateShort(m.date)) + '</p>' +
        '</div>';
    }).join('');
  }

  showModal('modalCharDetail');
}

async function toggleBucket(id) {
  const item = await dbGet('bucketlist', id);
  if (!item) return;
  item.completed = !item.completed;
  item.updatedAt = Date.now();
  await saveAndQueue('bucketlist', item);
  renderBucketList();
}

// ---- Audio Player ----

function toggleAudio(audioId, btn) {
  const audio = document.getElementById(audioId);
  if (!audio) return;
  if (audio.paused) {
    audio.play();
    btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    audio.onended = () => { btn.innerHTML = '<i class="fa-solid fa-play"></i>'; };
  } else {
    audio.pause();
    btn.innerHTML = '<i class="fa-solid fa-play"></i>';
  }
}

// ---- Countdowns for Time Capsules ----

function startCountdowns() {
  if (countdownTimer) clearInterval(countdownTimer);

  countdownTimer = setInterval(() => {
    document.querySelectorAll('.capsule-card[data-unlock]').forEach((card) => {
      const unlockDate = card.dataset.unlock;
      const cd = getCountdown(unlockDate);
      const cdEl = card.querySelector('.countdown');

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
  const startDate = getStartDate();
  const daysEl = document.getElementById('statDays');
  const memEl = document.getElementById('statMemories');
  const photoEl = document.getElementById('statPhotos');

  if (startDate) {
    daysEl.textContent = daysBetween(startDate);
  }

  const memories = await dbGetAll('memories');
  memEl.textContent = memories.length;

  let photoCount = 0;
  memories.forEach((m) => { if (m.photo) photoCount++; });
  const letters = await dbGetAll('letters');
  letters.forEach((l) => { if (l.photo) photoCount++; });
  const capsules = await dbGetAll('capsules');
  capsules.forEach((c) => { if (c.photo) photoCount++; });
  const locations = await dbGetAll('locations');
  locations.forEach((l) => { if (l.coverPhoto) photoCount++; });
  photoEl.textContent = photoCount;
}

// ---- Settings: Save Start Date ----

document.addEventListener('change', async (e) => {
  if (e.target.id === 'startDateInput') {
    setStartDate(e.target.value);
    updateNerdStats();
  }
});

// ============================================
// APP INITIALIZATION
// ============================================

async function initApp() {
  // Load saved start date into input
  const startDate = getStartDate();
  if (startDate) {
    document.getElementById('startDateInput').value = startDate;
  }

  // Set default date for memory form
  document.getElementById('memoryDate').value = todayStr();

  // Render everything
  navigate('home');

  // Start sync engine
  startSyncEngine();

  // Sign into Firebase
  if (navigator.onLine) {
    await signInAnonymously();
  }

  // Update stats
  updateNerdStats();
}

// ---- Handle initial PIN state on page load ----

window.addEventListener('DOMContentLoaded', () => {
  if (hasPin()) {
    document.getElementById('pinEnterBtn').classList.remove('hidden');
    document.getElementById('setPinBtn').classList.add('hidden');
  } else {
    document.getElementById('pinEnterBtn').classList.add('hidden');
    document.getElementById('setPinBtn').classList.add('hidden');
  }
});
