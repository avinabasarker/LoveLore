/* ============================================
   LoveLore Social — Main Application
   A private social media for two
   ============================================ */

// ---- Firebase Config ----
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBYzWLaHWmLCwiqBLSBnqOYC0MjHqu2OS8",
    authDomain: "lovelore-f99fb.firebaseapp.com",
    projectId: "lovelore-f99fb",
    storageBucket: "lovelore-f99fb.firebasestorage.app",
    messagingSenderId: "1063866736828",
    appId: "1:1063866736828:web:7f9f0aaa5cc0ff0d5370b9",
    measurementId: "G-WFW9FFEJ23"
};

// ---- Constants ----
const USERS = ['A', 'P'];
const SESSION_KEY = 'lovelore_session';
const ENC_STORAGE_KEY = 'lovelore_enc_secret';
const ACCOUNTS_COLLECTION = 'social_accounts';
const POSTS_COLLECTION = 'social_posts';
const COMMENTS_COLLECTION = 'social_comments';
const SETTINGS_COLLECTION = 'social_settings';
const CAPSULES_COLLECTION = 'social_capsules';
const MOODS_COLLECTION = 'social_moods';
const COUNTDOWNS_COLLECTION = 'social_countdowns';
const DAILY_NOTES_COLLECTION = 'social_daily_notes';
const IMAGE_MAX_WIDTH = 800;
const IMAGE_QUALITY = 0.6;

const REACTION_TYPES = {
    heart: { emoji: '❤️', label: 'Love' },
    love: { emoji: '😍', label: 'Adore' },
    kiss: { emoji: '💋', label: 'Kiss' },
    hug: { emoji: '🫂', label: 'Hug' },
    cry: { emoji: '😢', label: 'Emotional' },
    fire: { emoji: '🔥', label: 'Hot' }
};

const MOOD_MAP = {
    loved: { emoji: '🥰', text: 'Feeling loved' },
    missing: { emoji: '💕', text: 'Missing you' },
    thinking: { emoji: '💭', text: 'Thinking of you' },
    excited: { emoji: '😍', text: "Can't wait!" },
    happy: { emoji: '😊', text: 'Happy' },
    sad: { emoji: '😢', text: 'Missing you badly' },
    grateful: { emoji: '🙏', text: 'Grateful for you' },
    playful: { emoji: '😜', text: 'Feeling playful' }
};

const DAILY_PROMPTS = [
    "What do you love most about your partner today?",
    "What's a favorite memory you share together?",
    "What made you smile about your partner recently?",
    "What's something new you discovered about your partner?",
    "What's the sweetest thing your partner did recently?",
    "What song reminds you of your partner?",
    "What's your favorite thing to do together?",
    "What's a dream you share as a couple?",
    "What's the funniest moment you've had together?",
    "What's something you appreciate about your partner?",
    "What's your partner's best quality?",
    "What moment made you fall in love?",
    "Where would you love to travel together?",
    "What's your partner's cutest habit?",
    "What does love mean to you?",
    "What's the most romantic thing about your relationship?",
    "What surprise would you love to give your partner?",
    "What's your favorite inside joke?",
    "What did you first notice about your partner?",
    "What makes your relationship special?",
    "What's a lesson your partner has taught you?",
    "What's a tradition you'd love to start together?",
    "What's the best gift your partner has given you?",
    "What makes your partner laugh?",
    "What's a challenge you've overcome together?",
    "What's your partner's hidden talent?",
    "What's a cozy moment you'd love to relive?",
    "What would your perfect day together look like?",
    "What's a small thing your partner does that means a lot?",
    "What's a word that describes your love?",
    "What's a promise you want to make to your partner?",
    "What's the most beautiful place you've been together?",
    "What does home mean to you as a couple?",
    "What's a meal you'd love to cook together?",
    "What's something you're grateful for today?",
    "What's a silly thing you both love?",
    "What's a movie that reminds you of your relationship?",
    "What's a quote that describes your love?",
    "What's your favorite way to show affection?",
    "What's a goal you're working toward together?",
    "What's the most peaceful moment you've shared?",
    "What's a skill you'd love to learn together?",
    "What's a message you'd send your future selves?",
    "What's a season that feels most romantic to you?",
    "What's the kindest thing your partner has done?",
    "What's a pet name you love?",
    "What's a habit you've picked up from your partner?",
    "What's a picture-perfect moment you'd capture?",
    "What's the best advice you'd give other couples?",
    "What's a place that holds special meaning for you both?",
    "What's a song you'd dance to right now?",
    "What's a memory that still gives you butterflies?",
    "What's a way your partner inspires you?",
    "What's a small gesture that means everything?",
    "What's a dream date you haven't had yet?",
    "What's something your partner doesn't know you notice?",
    "What's a word your partner always says that you love?",
    "What's the strongest thing about your bond?"
];

// ---- App State ----
let currentUser = null;
let fdb = null;
let fAuth = null;
let postsUnsubscribe = null;
let commentsUnsubscribe = null;
let capsulesUnsubscribe = null;
let countdownsUnsubscribe = null;
let moodsUnsubscribe = null;
let currentPostForComments = null;
let pendingImageData = null;
let selectedUser = null;
let lastTapTime = 0;
let lastTapPostId = null;
let allPostsCache = [];
let allMoodsCache = {};

// ---- Encryption State ----
let encryptionKey = null;
let isEncryptionSetup = false;
const _decryptCache = new Map();

// ============ ENCRYPTION MODULE ============

async function deriveAESKey(secret) {
    const keyMaterial = await crypto.subtle.importKey(
        'raw', new TextEncoder().encode(secret), 'PBKDF2', false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: new TextEncoder().encode('lovelore_v1_salt'), iterations: 100000, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

async function encryptText(plaintext) {
    if (!encryptionKey || !plaintext) return plaintext;
    try {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encoded = new TextEncoder().encode(plaintext);
        const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, encryptionKey, encoded);
        const combined = new Uint8Array(iv.length + ciphertext.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(ciphertext), iv.length);
        return 'ENC:' + btoa(String.fromCharCode(...combined));
    } catch (e) { console.error('Encrypt failed:', e); return plaintext; }
}

async function decryptText(ciphertext) {
    if (!ciphertext || !ciphertext.startsWith('ENC:')) return ciphertext;
    try {
        const raw = atob(ciphertext.substring(4));
        const combined = Uint8Array.from(raw, c => c.charCodeAt(0));
        const iv = combined.slice(0, 12);
        const data = combined.slice(12);
        const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, encryptionKey, data);
        return new TextDecoder().decode(decrypted);
    } catch (e) { console.error('Decrypt failed:', e); return ciphertext; }
}

async function decryptField(ciphertext, docId, field) {
    if (!ciphertext || !ciphertext.startsWith('ENC:')) return ciphertext;
    const cacheKey = `${docId}:${field}`;
    if (_decryptCache.has(cacheKey)) return _decryptCache.get(cacheKey);
    const result = await decryptText(ciphertext);
    if (_decryptCache.size > 100) { const k = _decryptCache.keys().next().value; _decryptCache.delete(k); }
    _decryptCache.set(cacheKey, result);
    return result;
}

async function hashSecret(secret) {
    const data = new TextEncoder().encode(secret + '_lovelore_enc_hash_v1');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function storeEncSecretLocal(secret) { localStorage.setItem(ENC_STORAGE_KEY, btoa(secret)); }
function getStoredEncSecret() { const s = localStorage.getItem(ENC_STORAGE_KEY); return s ? atob(s) : null; }

// ============ INITIALIZATION ============

document.addEventListener('DOMContentLoaded', () => {
    initFirebase();
    checkSession();
    setupEventListeners();
});

function initFirebase() {
    try {
        if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
        fdb = firebase.firestore();
        fAuth = firebase.auth();
        fdb.enablePersistence({ synchronizeTabs: true }).catch(err => {
            if (err.code === 'failed-precondition') console.warn('Firestore: multiple tabs');
            else if (err.code === 'unimplemented') console.warn('Firestore: persistence not supported');
        });
        fAuth.signInAnonymously().catch(e => console.error('Auth failed:', e));
        console.log('Firebase initialized');
    } catch (e) { console.error('Firebase init failed:', e); }
}

function checkSession() {
    try {
        const session = localStorage.getItem(SESSION_KEY);
        if (session) {
            const data = JSON.parse(session);
            if (data.username && USERS.includes(data.username)) {
                currentUser = data.username;
                // Try to restore encryption
                const storedSecret = getStoredEncSecret();
                if (storedSecret) {
                    deriveAESKey(storedSecret).then(key => {
                        encryptionKey = key;
                        isEncryptionSetup = true;
                        showMainApp();
                    });
                    return;
                }
                showMainApp();
                return;
            }
        }
    } catch (e) { localStorage.removeItem(SESSION_KEY); }
}

// ============ EVENT LISTENERS ============

function setupEventListeners() {
    // Avatar selection
    document.querySelectorAll('.avatar-btn').forEach(btn => {
        btn.addEventListener('click', () => handleAvatarSelect(btn.dataset.user));
    });
    // Set password
    document.getElementById('setPasswordBtn').addEventListener('click', handleSetPassword);
    document.getElementById('confirmPassword').addEventListener('keydown', e => { if (e.key === 'Enter') handleSetPassword(); });
    // Login
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    document.getElementById('loginPassword').addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });
    // Back button
    document.getElementById('backToAvatar').addEventListener('click', () => {
        document.getElementById('passwordSection').style.display = 'none';
        document.getElementById('avatarSection').style.display = 'block';
        clearAuthErrors();
    });
    // Encryption setup
    document.getElementById('setSecretBtn').addEventListener('click', handleSetSecret);
    document.getElementById('unlockSecretBtn').addEventListener('click', handleUnlockSecret);
    // FAB
    document.getElementById('fabCreate').addEventListener('click', openCreatePostModal);
    // Create post
    document.getElementById('closeCreatePost').addEventListener('click', closeCreatePostModal);
    document.getElementById('postBtn').addEventListener('click', createPost);
    document.getElementById('postText').addEventListener('input', updatePostBtnState);
    document.getElementById('imageInput').addEventListener('change', handleImageSelect);
    document.getElementById('removeImage').addEventListener('click', removeSelectedImage);
    // Comments
    document.getElementById('closeComments').addEventListener('click', closeCommentsModal);
    document.getElementById('sendComment').addEventListener('click', addComment);
    document.getElementById('commentInput').addEventListener('keydown', e => { if (e.key === 'Enter') addComment(); });
    document.getElementById('commentInput').addEventListener('input', updateSendBtnState);
    // Image viewer
    document.getElementById('closeViewer').addEventListener('click', closeImageViewer);
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => switchScreen(btn.dataset.screen));
    });
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    // Modal overlay clicks
    document.getElementById('createPostModal').addEventListener('click', e => { if (e.target === e.currentTarget) closeCreatePostModal(); });
    document.getElementById('commentsModal').addEventListener('click', e => { if (e.target === e.currentTarget) closeCommentsModal(); });
    // Online/offline
    window.addEventListener('online', () => updateSyncDot('synced'));
    window.addEventListener('offline', () => updateSyncDot('offline'));
    // Reaction picker - close on click outside
    document.addEventListener('click', e => {
        const picker = document.getElementById('reactionPicker');
        if (picker.style.display !== 'none' && !picker.contains(e.target) && !e.target.closest('.react-btn')) {
            picker.style.display = 'none';
        }
    });
    // Capsule image
    document.getElementById('capsuleImageInput').addEventListener('change', handleCapsuleImageSelect);
    // Emoji picks for countdown
    document.querySelectorAll('.emoji-pick').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.emoji-pick').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    // ---- NEW FEATURE BUTTON WIRING ----
    // Mood indicator in top bar
    document.getElementById('moodIndicatorTop').addEventListener('click', openMoodSetter);
    // Capsules tab: add buttons
    document.getElementById('addCountdownBtn').addEventListener('click', openCountdownModal);
    document.getElementById('addCapsuleBtn').addEventListener('click', openCapsuleCreateModal);
    // Capsule create modal: close + seal button + remove image
    document.getElementById('closeCapsuleCreate').addEventListener('click', closeCapsuleCreateModal);
    document.getElementById('createCapsuleBtn').addEventListener('click', createCapsule);
    document.getElementById('removeCapsuleImage').addEventListener('click', removeCapsuleImage);
    // Capsule view modal: close
    document.getElementById('closeCapsuleView').addEventListener('click', closeCapsuleViewModal);
    // Countdown modal: close + create button
    document.getElementById('closeCountdownModal').addEventListener('click', closeCountdownModal);
    document.getElementById('createCountdownBtn').addEventListener('click', createCountdown);
    // Mood modal: close + set button + mood options
    document.getElementById('closeMoodModal').addEventListener('click', closeMoodModal);
    document.getElementById('setMoodBtn').addEventListener('click', setMood);
    document.querySelectorAll('.mood-opt').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.mood-opt').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            selectedMood = opt.dataset.mood;
        });
    });
    // Daily note modal: close + send + banner click
    document.getElementById('closeDailyNoteModal').addEventListener('click', closeDailyNoteModal);
    document.getElementById('sendDailyNoteBtn').addEventListener('click', submitDailyNote);
    document.getElementById('dailyNoteBanner').addEventListener('click', openDailyNoteModal);
    // Close modals on overlay click
    ['capsuleCreateModal', 'capsuleViewModal', 'countdownModal', 'moodModal', 'dailyNoteModal'].forEach(id => {
        document.getElementById(id).addEventListener('click', e => { if (e.target === e.currentTarget) e.target.style.display = 'none'; });
    });
}

// ============ AUTH SYSTEM ============

async function handleAvatarSelect(user) {
    selectedUser = user;
    document.querySelectorAll('.avatar-btn').forEach(b => b.classList.remove('selected'));
    document.querySelector(`.avatar-btn[data-user="${user}"]`).classList.add('selected');
    try {
        updateSyncDot('syncing');
        const doc = await fdb.collection(ACCOUNTS_COLLECTION).doc(user.toLowerCase()).get();
        const avatarClass = `user-${user.toLowerCase()}`;
        document.getElementById('setPassAvatar').className = `mini-avatar ${avatarClass}`;
        document.getElementById('setPassAvatar').textContent = user;
        document.getElementById('loginAvatar').className = `mini-avatar ${avatarClass}`;
        document.getElementById('loginAvatar').textContent = user;
        document.getElementById('loginUserName').textContent = user;
        if (doc.exists && doc.data().passwordHash) {
            document.getElementById('setPasswordForm').style.display = 'none';
            document.getElementById('loginForm').style.display = 'block';
        } else {
            document.getElementById('setPasswordForm').style.display = 'block';
            document.getElementById('loginForm').style.display = 'none';
        }
        document.getElementById('avatarSection').style.display = 'none';
        document.getElementById('passwordSection').style.display = 'block';
        document.getElementById('passwordSection').style.animation = 'fadeInUp 0.3s ease-out';
        updateSyncDot('synced');
    } catch (e) {
        console.error('Account check failed:', e);
        showToast('Connection error. Try again.');
        updateSyncDot('error');
    }
}

async function handleSetPassword() {
    const pass = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmPassword').value;
    if (!pass || pass.length < 1) { showAuthError('setPassError', 'Please enter a password'); return; }
    if (pass !== confirm) { showAuthError('setPassError', "Passwords don't match"); return; }
    try {
        updateSyncDot('syncing');
        const hash = await hashPassword(pass);
        const uid = fAuth.currentUser ? fAuth.currentUser.uid : 'unknown';
        await fdb.collection(ACCOUNTS_COLLECTION).doc(selectedUser.toLowerCase()).set({
            username: selectedUser, passwordHash: hash, uid: uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        currentUser = selectedUser;
        saveSession(currentUser);
        updateSyncDot('synced');
        checkEncryptionAndProceed();
    } catch (e) {
        console.error('Set password failed:', e);
        showAuthError('setPassError', 'Something went wrong. Try again.');
        updateSyncDot('error');
    }
}

async function handleLogin() {
    const pass = document.getElementById('loginPassword').value;
    if (!pass) { showAuthError('loginError', 'Please enter your password'); return; }
    try {
        updateSyncDot('syncing');
        const doc = await fdb.collection(ACCOUNTS_COLLECTION).doc(selectedUser.toLowerCase()).get();
        if (!doc.exists || !doc.data().passwordHash) { showAuthError('loginError', 'Account not found'); updateSyncDot('error'); return; }
        const hash = await hashPassword(pass);
        if (hash === doc.data().passwordHash) {
            currentUser = selectedUser;
            saveSession(currentUser);
            // Update UID
            const uid = fAuth.currentUser ? fAuth.currentUser.uid : 'unknown';
            await fdb.collection(ACCOUNTS_COLLECTION).doc(selectedUser.toLowerCase()).set({ uid }, { merge: true });
            updateSyncDot('synced');
            checkEncryptionAndProceed();
        } else {
            showAuthError('loginError', 'Wrong password');
            updateSyncDot('error');
        }
    } catch (e) {
        console.error('Login failed:', e);
        showAuthError('loginError', 'Something went wrong. Try again.');
        updateSyncDot('error');
    }
}

async function hashPassword(password) {
    const data = new TextEncoder().encode(password + '_lovelore_salt_2024');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function saveSession(username) { localStorage.setItem(SESSION_KEY, JSON.stringify({ username, ts: Date.now() })); }

function handleLogout() {
    if (postsUnsubscribe) postsUnsubscribe();
    if (commentsUnsubscribe) commentsUnsubscribe();
    if (capsulesUnsubscribe) capsulesUnsubscribe();
    if (countdownsUnsubscribe) countdownsUnsubscribe();
    if (moodsUnsubscribe) moodsUnsubscribe();
    postsUnsubscribe = null; commentsUnsubscribe = null;
    capsulesUnsubscribe = null; countdownsUnsubscribe = null;
    moodsUnsubscribe = null;
    currentUser = null; selectedUser = null; allPostsCache = [];
    allMoodsCache = {}; encryptionKey = null; isEncryptionSetup = false;
    _decryptCache.clear();
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(ENC_STORAGE_KEY);
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('avatarSection').style.display = 'block';
    document.getElementById('passwordSection').style.display = 'none';
    document.querySelectorAll('.avatar-btn').forEach(b => b.classList.remove('selected'));
    clearAuthFields(); clearAuthErrors();
}

function showAuthError(id, msg) { const el = document.getElementById(id); el.textContent = msg; el.style.display = 'block'; }
function clearAuthErrors() { document.getElementById('setPassError').style.display = 'none'; document.getElementById('loginError').style.display = 'none'; }
function clearAuthFields() { document.getElementById('newPassword').value = ''; document.getElementById('confirmPassword').value = ''; document.getElementById('loginPassword').value = ''; }

// ============ ENCRYPTION SETUP FLOW ============

async function checkEncryptionAndProceed() {
    // Check if shared secret exists in Firestore
    try {
        const doc = await fdb.collection(SETTINGS_COLLECTION).doc('encryption').get();
        if (doc.exists && doc.data().secretHash) {
            // Secret exists - need to unlock
            const storedLocal = getStoredEncSecret();
            if (storedLocal) {
                const verifyHash = await hashSecret(storedLocal);
                if (verifyHash === doc.data().secretHash) {
                    encryptionKey = await deriveAESKey(storedLocal);
                    isEncryptionSetup = true;
                    showMainApp();
                    return;
                }
            }
            // Show unlock screen
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('encryptionScreen').style.display = 'flex';
            document.getElementById('setSecretForm').style.display = 'none';
            document.getElementById('unlockSecretForm').style.display = 'block';
        } else {
            // No secret yet - show set screen
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('encryptionScreen').style.display = 'flex';
            document.getElementById('setSecretForm').style.display = 'block';
            document.getElementById('unlockSecretForm').style.display = 'none';
        }
    } catch (e) {
        console.error('Encryption check failed:', e);
        showMainApp(); // Fallback to unencrypted
    }
}

async function handleSetSecret() {
    const secret = document.getElementById('newSecret').value;
    const confirm = document.getElementById('confirmSecret').value;
    if (!secret || secret.length < 4) { showAuthError('secretError', 'Secret must be at least 4 characters'); return; }
    if (secret !== confirm) { showAuthError('secretError', "Secrets don't match"); return; }
    try {
        const hash = await hashSecret(secret);
        await fdb.collection(SETTINGS_COLLECTION).doc('encryption').set({
            secretHash: hash,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        encryptionKey = await deriveAESKey(secret);
        isEncryptionSetup = true;
        storeEncSecretLocal(secret);
        showToast('Encryption enabled! Your data is now private.');
        showMainApp();
    } catch (e) {
        console.error('Set secret failed:', e);
        showAuthError('secretError', 'Something went wrong');
    }
}

async function handleUnlockSecret() {
    const secret = document.getElementById('unlockSecret').value;
    if (!secret) { showAuthError('unlockError', 'Please enter the shared secret'); return; }
    try {
        const hash = await hashSecret(secret);
        const doc = await fdb.collection(SETTINGS_COLLECTION).doc('encryption').get();
        if (doc.exists && doc.data().secretHash === hash) {
            encryptionKey = await deriveAESKey(secret);
            isEncryptionSetup = true;
            storeEncSecretLocal(secret);
            showMainApp();
        } else {
            showAuthError('unlockError', 'Wrong secret phrase');
        }
    } catch (e) {
        console.error('Unlock failed:', e);
        showAuthError('unlockError', 'Something went wrong');
    }
}

// ============ MAIN APP ============

function showMainApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('encryptionScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    const lower = currentUser.toLowerCase();
    const avatarClass = `user-${lower}`;
    document.getElementById('createPostAvatar').className = `mini-avatar ${avatarClass}`;
    document.getElementById('createPostAvatar').textContent = currentUser;
    document.getElementById('createPostUser').textContent = currentUser;
    document.getElementById('commentAvatar').className = `mini-avatar tiny ${avatarClass}`;
    document.getElementById('commentAvatar').textContent = currentUser;
    attachPostsListener();
    attachMoodsListener();
    attachCapsulesListener();
    attachCountdownsListener();
    loadAnniversary();
    loadDailyNote();
    renderProfile();
}

// ============ REAL-TIME POSTS ============

function attachPostsListener() {
    if (postsUnsubscribe) postsUnsubscribe();
    updateSyncDot('syncing');
    document.getElementById('feedLoader').style.display = 'flex';
    postsUnsubscribe = fdb.collection(POSTS_COLLECTION)
        .orderBy('createdAt', 'desc')
        .onSnapshot(async snapshot => {
            const posts = [];
            for (const doc of snapshot.docs) {
                const data = doc.data();
                if (isEncryptionSetup) {
                    data.text = await decryptField(data.text, doc.id, 'text');
                    if (data.imageData) data.imageData = await decryptField(data.imageData, doc.id, 'imageData');
                }
                posts.push({ id: doc.id, ...data });
            }
            allPostsCache = posts;
            renderFeed(posts);
            renderGallery(posts);
            renderTimeline(posts);
            document.getElementById('feedLoader').style.display = 'none';
            updateSyncDot('synced');
        }, error => {
            console.error('Posts listener error:', error);
            document.getElementById('feedLoader').style.display = 'none';
            updateSyncDot('error');
        });
}

// ============ FEED RENDERING ============

function renderFeed(posts) {
    const container = document.getElementById('postsContainer');
    const emptyState = document.getElementById('emptyFeed');
    if (!posts || posts.length === 0) { container.innerHTML = ''; emptyState.classList.add('show'); return; }
    emptyState.classList.remove('show');
    container.innerHTML = posts.map(post => renderPostCard(post)).join('');
    // Event listeners
    container.querySelectorAll('.react-btn').forEach(btn => {
        btn.addEventListener('click', e => { e.stopPropagation(); openReactionPicker(btn); });
    });
    container.querySelectorAll('.comment-btn').forEach(btn => {
        btn.addEventListener('click', () => openCommentsModal(btn.dataset.postId));
    });
    container.querySelectorAll('.post-image-wrapper').forEach(wrapper => {
        wrapper.addEventListener('click', () => {
            const postId = wrapper.dataset.postId;
            const postAuthor = wrapper.dataset.postAuthor;
            const now = Date.now();
            if (lastTapPostId === postId && (now - lastTapTime) < 300) {
                handleDoubleTapLike(postId, postAuthor);
                lastTapTime = 0; lastTapPostId = null;
            } else {
                lastTapTime = now; lastTapPostId = postId;
                setTimeout(() => {
                    if (lastTapPostId === postId && lastTapTime === now) {
                        const img = wrapper.querySelector('img');
                        if (img) openImageViewer(img.src);
                    }
                }, 300);
            }
        });
    });
    container.querySelectorAll('.post-comment-preview').forEach(el => {
        el.addEventListener('click', () => openCommentsModal(el.dataset.postId));
    });
}

function renderPostCard(post) {
    const lower = (post.author || 'a').toLowerCase();
    const avatarClass = `user-${lower}`;
    const timeStr = timeAgo(post.createdAt);
    const commentCount = post.commentCount || 0;

    // Reactions
    const reactions = post.reactions || {};
    const myReaction = reactions[currentUser.toLowerCase()] || null;
    // Build reaction summary
    const reactionCounts = {};
    Object.values(reactions).forEach(r => { reactionCounts[r] = (reactionCounts[r] || 0) + 1; });
    const totalReactions = Object.keys(reactions).length;

    let reactionSummaryHtml = '';
    if (totalReactions > 0) {
        const badges = Object.entries(reactionCounts).map(([type, count]) => {
            const info = REACTION_TYPES[type];
            return info ? `<span class="reaction-badge"><span class="r-emoji">${info.emoji}</span><span class="r-count">${count}</span></span>` : '';
        }).join('');
        reactionSummaryHtml = `<div class="reaction-summary">${badges}</div>`;
    }

    let imageHtml = '';
    if (post.imageData) {
        imageHtml = `<div class="post-image-wrapper" data-post-id="${post.id}" data-post-author="${post.author}">
            <img src="${post.imageData}" alt="Post image" loading="lazy"></div>`;
    }

    let commentPreview = '';
    if (commentCount > 0) {
        commentPreview = `<div class="post-comment-preview" data-post-id="${post.id}">View ${commentCount === 1 ? 'comment' : 'all ' + commentCount + ' comments'}</div>`;
    }

    let textHtml = '';
    if (post.text) textHtml = `<div class="post-text-content">${escapeHtml(post.text)}</div>`;

    // Reaction button shows current reaction emoji or default heart
    const reactEmoji = myReaction ? (REACTION_TYPES[myReaction]?.emoji || '❤️') : '';
    const reactIcon = myReaction ? reactEmoji : '<i class="far fa-heart"></i>';

    return `
        <div class="post-card" data-post-id="${post.id}">
            <div class="post-header">
                <div class="post-avatar ${avatarClass}">${post.author || '?'}</div>
                <div class="post-user-info">
                    <div class="post-author">${escapeHtml(post.author || 'Unknown')}</div>
                    <div class="post-time">${timeStr}</div>
                </div>
            </div>
            ${imageHtml}
            ${textHtml}
            <div class="post-actions">
                <button class="post-action-btn react-btn" data-post-id="${post.id}" data-post-author="${post.author}">${reactIcon}</button>
                <button class="post-action-btn comment-btn" data-post-id="${post.id}"><i class="far fa-comment"></i></button>
            </div>
            ${reactionSummaryHtml}
            ${commentPreview}
        </div>`;
}

// ============ REACTIONS ============

let currentReactTarget = null;

function openReactionPicker(btn) {
    const picker = document.getElementById('reactionPicker');
    const rect = btn.getBoundingClientRect();
    picker.style.left = Math.max(8, rect.left - 20) + 'px';
    picker.style.top = (rect.top - 48) + 'px';
    picker.style.display = 'flex';
    currentReactTarget = { postId: btn.dataset.postId, postAuthor: btn.dataset.postAuthor };

    // Set up reaction option clicks
    picker.querySelectorAll('.reaction-opt').forEach(opt => {
        opt.onclick = () => {
            addReaction(currentReactTarget.postId, currentReactTarget.postAuthor, opt.dataset.reaction);
            picker.style.display = 'none';
        };
    });
}

async function addReaction(postId, postAuthor, reactionType) {
    try {
        const postRef = fdb.collection(POSTS_COLLECTION).doc(postId);
        const userKey = currentUser.toLowerCase();
        // Check if user already has this reaction
        const doc = await postRef.get();
        if (!doc.exists) return;
        const reactions = doc.data().reactions || {};
        if (reactions[userKey] === reactionType) {
            // Remove reaction (toggle off)
            await postRef.update({ [`reactions.${userKey}`]: firebase.firestore.FieldValue.delete() });
        } else {
            await postRef.update({ [`reactions.${userKey}`]: reactionType });
        }
    } catch (e) { console.error('Add reaction failed:', e); }
}

function handleDoubleTapLike(postId, postAuthor) {
    const heart = document.getElementById('doubleTapHeart');
    heart.classList.remove('show'); void heart.offsetWidth;
    heart.style.display = 'block'; heart.classList.add('show');
    setTimeout(() => { heart.style.display = 'none'; heart.classList.remove('show'); }, 800);
    // Default double-tap = heart reaction
    addReaction(postId, postAuthor, 'heart');
}

// ============ COMMENTS ============

function openCommentsModal(postId) {
    currentPostForComments = postId;
    document.getElementById('commentsModal').style.display = 'flex';
    document.getElementById('commentInput').value = '';
    updateSendBtnState();
    loadComments(postId);
}

function closeCommentsModal() {
    document.getElementById('commentsModal').style.display = 'none';
    if (commentsUnsubscribe) { commentsUnsubscribe(); commentsUnsubscribe = null; }
    currentPostForComments = null;
}

function loadComments(postId) {
    if (commentsUnsubscribe) commentsUnsubscribe();
    commentsUnsubscribe = fdb.collection(COMMENTS_COLLECTION)
        .where('postId', '==', postId)
        .onSnapshot(async snapshot => {
            const comments = [];
            for (const doc of snapshot.docs) {
                const data = doc.data();
                if (isEncryptionSetup) {
                    data.text = await decryptField(data.text, doc.id, 'text');
                }
                comments.push({ id: doc.id, ...data });
            }
            comments.sort((a, b) => {
                const timeA = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime()) : 0;
                const timeB = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime()) : 0;
                return timeA - timeB;
            });
            renderComments(comments);
        }, error => { console.error('Comments listener error:', error); });
}

function renderComments(comments) {
    const list = document.getElementById('commentsList');
    if (!comments || comments.length === 0) {
        list.innerHTML = '<div class="comments-empty"><p>No comments yet. Say something sweet!</p></div>';
        return;
    }
    list.innerHTML = comments.map(c => {
        const lower = (c.author || 'a').toLowerCase();
        const avatarClass = `user-${lower}`;
        return `<div class="comment-item">
            <div class="comment-avatar ${avatarClass}">${c.author || '?'}</div>
            <div class="comment-body">
                <span class="comment-author">${escapeHtml(c.author || 'Unknown')}</span>
                <div class="comment-text">${escapeHtml(c.text || '')}</div>
                <div class="comment-time">${timeAgo(c.createdAt)}</div>
            </div>
        </div>`;
    }).join('');
    list.scrollTop = list.scrollHeight;
}

async function addComment() {
    const input = document.getElementById('commentInput');
    const rawText = input.value.trim();
    if (!rawText || !currentPostForComments) return;
    try {
        input.value = ''; updateSendBtnState();
        const encText = isEncryptionSetup ? await encryptText(rawText) : rawText;
        await fdb.collection(COMMENTS_COLLECTION).add({
            postId: currentPostForComments, author: currentUser,
            text: encText, encrypted: isEncryptionSetup,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        await fdb.collection(POSTS_COLLECTION).doc(currentPostForComments).update({
            commentCount: firebase.firestore.FieldValue.increment(1)
        });
    } catch (e) { console.error('Add comment failed:', e); showToast('Failed to post comment'); input.value = rawText; }
}

function updateSendBtnState() {
    document.getElementById('sendComment').disabled = !document.getElementById('commentInput').value.trim();
}

// ============ CREATE POST ============

function openCreatePostModal() {
    document.getElementById('createPostModal').style.display = 'flex';
    document.getElementById('postText').value = '';
    document.getElementById('postText').focus();
    pendingImageData = null;
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('imageInput').value = '';
    updatePostBtnState();
}

function closeCreatePostModal() {
    document.getElementById('createPostModal').style.display = 'none';
    pendingImageData = null;
}

async function handleImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('Image too large. Max 5MB.'); return; }
    try {
        const compressed = await compressImage(file);
        pendingImageData = compressed;
        document.getElementById('previewImg').src = compressed;
        document.getElementById('imagePreview').style.display = 'block';
        updatePostBtnState();
    } catch (err) { console.error('Image compression failed:', err); showToast('Failed to process image'); }
}

function removeSelectedImage() {
    pendingImageData = null;
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('imageInput').value = '';
    updatePostBtnState();
}

function updatePostBtnState() {
    document.getElementById('postBtn').disabled = !document.getElementById('postText').value.trim() && !pendingImageData;
}

async function createPost() {
    const rawText = document.getElementById('postText').value.trim();
    if (!rawText && !pendingImageData) return;
    const btn = document.getElementById('postBtn');
    btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';
    try {
        const encText = (isEncryptionSetup && rawText) ? await encryptText(rawText) : (rawText || '');
        const encImage = (isEncryptionSetup && pendingImageData) ? await encryptText(pendingImageData) : (pendingImageData || null);
        await fdb.collection(POSTS_COLLECTION).add({
            author: currentUser, text: encText, imageData: encImage,
            encrypted: isEncryptionSetup, reactions: {}, commentCount: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        closeCreatePostModal();
        showToast('Posted!');
    } catch (e) {
        console.error('Create post failed:', e);
        showToast('Failed to post. Try again.');
        btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane"></i> Post';
    }
}

// ============ IMAGE COMPRESSION ============

function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let w = img.width, h = img.height;
                if (w > IMAGE_MAX_WIDTH) { h = Math.round((h * IMAGE_MAX_WIDTH) / w); w = IMAGE_MAX_WIDTH; }
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL('image/jpeg', IMAGE_QUALITY));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ============ IMAGE VIEWER ============

function openImageViewer(src) {
    document.getElementById('viewerImg').src = src;
    document.getElementById('imageViewer').style.display = 'flex';
}
function closeImageViewer() { document.getElementById('imageViewer').style.display = 'none'; }

// ============ GALLERY ============

function renderGallery(posts) {
    const grid = document.getElementById('galleryGrid');
    const emptyEl = document.getElementById('galleryEmpty');
    if (!grid) return;
    const imagePosts = posts.filter(p => p.imageData);
    if (imagePosts.length === 0) { grid.innerHTML = ''; grid.style.display = 'none'; if (emptyEl) emptyEl.classList.add('show'); return; }
    if (emptyEl) emptyEl.classList.remove('show');
    grid.style.display = 'grid';
    grid.innerHTML = imagePosts.map(p => {
        const lower = (p.author || 'a').toLowerCase();
        return `<div class="gallery-item" data-image="${p.imageData}">
            <img src="${p.imageData}" alt="Photo by ${p.author}" loading="lazy">
            <div class="gallery-author-dot user-${lower}">${p.author || '?'}</div></div>`;
    }).join('');
    grid.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', () => openImageViewer(item.dataset.image));
    });
}

// ============ MEMORY TIMELINE ============

function renderTimeline(posts) {
    const container = document.getElementById('timelineContent');
    const emptyEl = document.getElementById('timelineEmpty');
    if (!container) return;
    if (!posts || posts.length === 0) {
        container.innerHTML = '';
        emptyEl.style.display = 'flex';
        return;
    }
    emptyEl.style.display = 'none';
    // Group by month
    const grouped = {};
    posts.forEach(p => {
        const date = p.createdAt ? (p.createdAt.toDate ? p.createdAt.toDate() : new Date(p.createdAt)) : new Date();
        const key = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(p);
    });
    const sortedMonths = Object.keys(grouped).sort().reverse();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    let html = '';
    sortedMonths.forEach(key => {
        const [year, month] = key.split('-');
        const label = monthNames[parseInt(month) - 1] + ' ' + year;
        const monthPosts = grouped[key];
        html += `<div class="timeline-month">
            <div class="timeline-month-header">
                <div class="timeline-month-dot"></div>
                <span class="timeline-month-label">${label}</span>
                <div class="timeline-month-line"></div>
                <span style="font-size:12px;color:var(--text-light)">${monthPosts.length} moment${monthPosts.length > 1 ? 's' : ''}</span>
            </div>`;
        monthPosts.forEach(p => {
            const lower = (p.author || 'a').toLowerCase();
            const avatarClass = `user-${lower}`;
            const timeStr = timeAgo(p.createdAt);
            let imgHtml = '';
            if (p.imageData) imgHtml = `<img class="timeline-item-img" src="${p.imageData}" alt="" onclick="openImageViewer('${p.imageData.replace(/'/g, "\\'")}')">`;
            html += `<div class="timeline-item">
                <div class="timeline-item-avatar ${avatarClass}">${p.author || '?'}</div>
                <div class="timeline-item-body">
                    <div class="timeline-item-text">${escapeHtml(p.text || '')}</div>
                    <div class="timeline-item-time">${timeStr}</div>
                </div>
                ${imgHtml}
            </div>`;
        });
        html += '</div>';
    });
    container.innerHTML = html;
}

// ============ TIME CAPSULES ============

function attachCapsulesListener() {
    if (capsulesUnsubscribe) capsulesUnsubscribe();
    capsulesUnsubscribe = fdb.collection(CAPSULES_COLLECTION)
        .orderBy('openDate', 'asc')
        .onSnapshot(async snapshot => {
            const capsules = [];
            for (const doc of snapshot.docs) {
                const data = doc.data();
                if (isEncryptionSetup) {
                    data.text = await decryptField(data.text, doc.id, 'text');
                    if (data.imageData) data.imageData = await decryptField(data.imageData, doc.id, 'imageData');
                }
                capsules.push({ id: doc.id, ...data });
            }
            renderCapsules(capsules);
        }, error => console.error('Capsules listener error:', error));
}

function renderCapsules(capsules) {
    const list = document.getElementById('capsulesList');
    const emptyEl = document.getElementById('capsulesEmpty');
    if (!capsules || capsules.length === 0) {
        list.innerHTML = ''; emptyEl.style.display = 'block'; return;
    }
    emptyEl.style.display = 'none';
    const now = new Date();
    list.innerHTML = capsules.map(c => {
        const openDate = new Date(c.openDate);
        const canOpen = now >= openDate;
        const dateStr = openDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        if (canOpen) {
            return `<div class="capsule-card" onclick="openCapsuleView('${c.id}')">
                <div class="capsule-opened">
                    <div class="capsule-open-icon">🎁</div>
                    <div class="capsule-open-info">
                        <div class="capsule-open-label">Opened Capsule</div>
                        <div class="capsule-open-preview">${escapeHtml((c.text || '').substring(0, 50))}${(c.text || '').length > 50 ? '...' : ''}</div>
                    </div>
                    <div class="capsule-open-arrow"><i class="fas fa-chevron-right"></i></div>
                </div></div>`;
        } else {
            return `<div class="capsule-card">
                <div class="capsule-sealed">
                    <div class="capsule-seal-icon"><i class="fas fa-lock"></i></div>
                    <div class="capsule-seal-info">
                        <div class="capsule-seal-label">Sealed Capsule</div>
                        <div class="capsule-seal-date">Opens on ${dateStr}</div>
                        <div class="capsule-seal-author">By ${c.author || '?'}</div>
                    </div>
                    <div class="capsule-seal-lock"><i class="fas fa-hourglass-half"></i></div>
                </div></div>`;
        }
    }).join('');
}

let capsuleImageData = null;

function openCapsuleCreateModal() {
    document.getElementById('capsuleCreateModal').style.display = 'flex';
    document.getElementById('capsuleText').value = '';
    document.getElementById('capsuleOpenDate').value = '';
    document.getElementById('capsuleOpenDate').min = new Date().toISOString().split('T')[0];
    capsuleImageData = null;
    document.getElementById('capsuleImagePreview').style.display = 'none';
    document.getElementById('capsuleImageInput').value = '';
}

function closeCapsuleCreateModal() { document.getElementById('capsuleCreateModal').style.display = 'none'; capsuleImageData = null; }

async function handleCapsuleImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('Image too large. Max 5MB.'); return; }
    try {
        const compressed = await compressImage(file);
        capsuleImageData = compressed;
        document.getElementById('capsulePreviewImg').src = compressed;
        document.getElementById('capsuleImagePreview').style.display = 'block';
    } catch (err) { showToast('Failed to process image'); }
}

function removeCapsuleImage() {
    capsuleImageData = null;
    document.getElementById('capsuleImagePreview').style.display = 'none';
    document.getElementById('capsuleImageInput').value = '';
}

async function createCapsule() {
    const rawText = document.getElementById('capsuleText').value.trim();
    const openDate = document.getElementById('capsuleOpenDate').value;
    if (!rawText && !capsuleImageData) { showToast('Write something or add a photo'); return; }
    if (!openDate) { showToast('Pick an open date'); return; }
    const btn = document.getElementById('createCapsuleBtn');
    btn.disabled = true;
    try {
        const encText = (isEncryptionSetup && rawText) ? await encryptText(rawText) : (rawText || '');
        const encImage = (isEncryptionSetup && capsuleImageData) ? await encryptText(capsuleImageData) : (capsuleImageData || null);
        await fdb.collection(CAPSULES_COLLECTION).add({
            author: currentUser, text: encText, imageData: encImage,
            encrypted: isEncryptionSetup, openDate: openDate,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        closeCapsuleCreateModal();
        showToast('Capsule sealed!');
    } catch (e) { console.error('Create capsule failed:', e); showToast('Failed to create capsule'); }
    btn.disabled = false;
}

async function openCapsuleView(capsuleId) {
    try {
        const doc = await fdb.collection(CAPSULES_COLLECTION).doc(capsuleId).get();
        if (!doc.exists) return;
        const data = doc.data();
        if (isEncryptionSetup) {
            data.text = await decryptField(data.text, doc.id, 'text');
            if (data.imageData) data.imageData = await decryptField(data.imageData, doc.id, 'imageData');
        }
        const dateStr = data.openDate ? new Date(data.openDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
        let imgHtml = data.imageData ? `<img class="capsule-view-img" src="${data.imageData}" alt="Capsule photo">` : '';
        document.getElementById('capsuleViewContent').innerHTML = `
            <div class="capsule-view-meta">
                <div class="capsule-view-author">From ${data.author || '?'}</div>
                <div class="capsule-view-date">Opened on ${dateStr}</div>
            </div>
            ${imgHtml}
            <div class="capsule-view-text">${escapeHtml(data.text || '')}</div>`;
        document.getElementById('capsuleViewModal').style.display = 'flex';
    } catch (e) { console.error('Open capsule failed:', e); }
}

function closeCapsuleViewModal() { document.getElementById('capsuleViewModal').style.display = 'none'; }

// ============ COUNTDOWN EVENTS ============

function attachCountdownsListener() {
    if (countdownsUnsubscribe) countdownsUnsubscribe();
    countdownsUnsubscribe = fdb.collection(COUNTDOWNS_COLLECTION)
        .orderBy('targetDate', 'asc')
        .onSnapshot(snapshot => {
            const countdowns = [];
            snapshot.forEach(doc => countdowns.push({ id: doc.id, ...doc.data() }));
            renderCountdowns(countdowns);
        }, error => console.error('Countdowns listener error:', error));
}

function renderCountdowns(countdowns) {
    const list = document.getElementById('countdownsList');
    const emptyEl = document.getElementById('countdownsEmpty');
    if (!countdowns || countdowns.length === 0) {
        list.innerHTML = ''; emptyEl.style.display = 'block'; return;
    }
    emptyEl.style.display = 'none';
    const now = new Date();
    list.innerHTML = countdowns.map(c => {
        const target = new Date(c.targetDate);
        const diffMs = target - now;
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const isPast = diffDays < 0;
        const days = Math.abs(diffDays);
        const dateStr = target.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `<div class="countdown-card ${isPast ? 'countdown-past' : ''}">
            <div class="countdown-emoji">${c.emoji || '📅'}</div>
            <div class="countdown-info">
                <div class="countdown-name">${escapeHtml(c.name || '')}</div>
                <div class="countdown-date-label">${dateStr}</div>
            </div>
            <div class="countdown-days">
                <div class="countdown-days-num">${days}</div>
                <div class="countdown-days-label">${isPast ? 'days ago' : 'days'}</div>
            </div>
            <button class="countdown-delete" onclick="event.stopPropagation();deleteCountdown('${c.id}')"><i class="fas fa-times"></i></button>
        </div>`;
    }).join('');
}

function openCountdownModal() {
    document.getElementById('countdownModal').style.display = 'flex';
    document.getElementById('countdownName').value = '';
    document.getElementById('countdownDate').value = '';
    document.getElementById('countdownDate').min = new Date().toISOString().split('T')[0];
    document.querySelectorAll('.emoji-pick').forEach(b => b.classList.remove('active'));
    document.querySelector('.emoji-pick[data-emoji="✈️"]').classList.add('active');
}

function closeCountdownModal() { document.getElementById('countdownModal').style.display = 'none'; }

async function createCountdown() {
    const name = document.getElementById('countdownName').value.trim();
    const targetDate = document.getElementById('countdownDate').value;
    if (!name) { showToast('Give it a name'); return; }
    if (!targetDate) { showToast('Pick a date'); return; }
    const activeEmoji = document.querySelector('.emoji-pick.active');
    const emoji = activeEmoji ? activeEmoji.dataset.emoji : '📅';
    try {
        await fdb.collection(COUNTDOWNS_COLLECTION).add({
            author: currentUser, name, targetDate, emoji,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        closeCountdownModal();
        showToast('Countdown started!');
    } catch (e) { console.error('Create countdown failed:', e); showToast('Failed to create countdown'); }
}

async function deleteCountdown(id) {
    try { await fdb.collection(COUNTDOWNS_COLLECTION).doc(id).delete(); showToast('Countdown removed'); }
    catch (e) { console.error('Delete countdown failed:', e); }
}

// ============ MOOD / STATUS ============

function attachMoodsListener() {
    if (moodsUnsubscribe) moodsUnsubscribe();
    moodsUnsubscribe = fdb.collection(MOODS_COLLECTION)
        .onSnapshot(snapshot => {
            const moods = {};
            snapshot.forEach(doc => { moods[doc.id] = doc.data(); });
            allMoodsCache = moods;
            updateMoodUI(moods);
        }, error => console.error('Moods listener error:', error));
}

function updateMoodUI(moods) {
    // Update my mood in top bar
    const myMood = moods[currentUser.toLowerCase()];
    if (myMood && myMood.mood) {
        const moodInfo = MOOD_MAP[myMood.mood];
        document.getElementById('moodEmojiTop').textContent = moodInfo ? moodInfo.emoji : '😊';
    } else {
        document.getElementById('moodEmojiTop').textContent = '😊';
    }
    // Update partner mood bar
    const partner = currentUser === 'A' ? 'p' : 'a';
    const partnerMood = moods[partner];
    const bar = document.getElementById('partnerMoodBar');
    if (partnerMood && partnerMood.mood) {
        const moodInfo = MOOD_MAP[partnerMood.mood];
        document.getElementById('partnerMoodAvatar').textContent = partner.toUpperCase();
        document.getElementById('partnerMoodAvatar').className = `partner-mood-avatar user-${partner}`;
        document.getElementById('partnerMoodText').textContent = partnerMood.customText || (moodInfo ? moodInfo.text : '');
        document.getElementById('partnerMoodEmoji').textContent = moodInfo ? moodInfo.emoji : '';
        bar.style.display = 'flex';
    } else {
        bar.style.display = 'none';
    }
}

let selectedMood = null;

function openMoodSetter() {
    document.getElementById('moodModal').style.display = 'flex';
    // Pre-select current mood
    const myMood = allMoodsCache[currentUser.toLowerCase()];
    selectedMood = myMood ? myMood.mood : null;
    document.querySelectorAll('.mood-opt').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.mood === selectedMood);
    });
    document.getElementById('moodCustomText').value = (myMood && myMood.customText) || '';
}

function closeMoodModal() { document.getElementById('moodModal').style.display = 'none'; }

async function setMood() {
    if (!selectedMood) { showToast('Pick a mood'); return; }
    const customText = document.getElementById('moodCustomText').value.trim();
    try {
        await fdb.collection(MOODS_COLLECTION).doc(currentUser.toLowerCase()).set({
            user: currentUser, mood: selectedMood, customText: customText,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        closeMoodModal();
        showToast('Mood updated!');
    } catch (e) { console.error('Set mood failed:', e); showToast('Failed to set mood'); }
}

// ============ DAILY LOVE NOTE ============

function getDailyPrompt() {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    return DAILY_PROMPTS[dayOfYear % DAILY_PROMPTS.length];
}

function getTodayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function loadDailyNote() {
    const prompt = getDailyPrompt();
    document.getElementById('dailyNotePrompt').textContent = prompt;
    const todayKey = getTodayKey();

    // Listen for today's note
    fdb.collection(DAILY_NOTES_COLLECTION).doc(todayKey)
        .onSnapshot(async doc => {
            const banner = document.getElementById('dailyNoteBanner');
            if (!doc.exists) { banner.style.display = 'flex'; return; }
            const data = doc.data();
            if (isEncryptionSetup) {
                if (data.responses) {
                    for (const key of Object.keys(data.responses)) {
                        data.responses[key] = await decryptText(data.responses[key]);
                    }
                }
            }
            const myKey = currentUser.toLowerCase();
            const hasResponded = data.responses && data.responses[myKey];
            // Show banner if user hasn't responded yet
            banner.style.display = hasResponded ? 'none' : 'flex';
            banner.querySelector('.daily-note-action').innerHTML = hasResponded
                ? '<i class="fas fa-check" style="color:var(--secondary)"></i>'
                : '<i class="fas fa-pen"></i>';
        });

    // Banner click
    document.getElementById('dailyNoteBanner').addEventListener('click', () => openDailyNoteModal());
}

function openDailyNoteModal() {
    document.getElementById('dailyNoteModal').style.display = 'flex';
    document.getElementById('dailyNoteModalPrompt').textContent = getDailyPrompt();
    document.getElementById('dailyNoteInput').value = '';

    const todayKey = getTodayKey();
    const partner = currentUser === 'A' ? 'P' : 'p';
    const partnerKey = currentUser === 'A' ? 'p' : 'a';

    // Load existing note
    fdb.collection(DAILY_NOTES_COLLECTION).doc(todayKey).get().then(async doc => {
        const partnerSection = document.getElementById('dailyNotePartnerResponse');
        if (doc.exists) {
            const data = doc.data();
            if (isEncryptionSetup && data.responses) {
                for (const key of Object.keys(data.responses)) {
                    data.responses[key] = await decryptText(data.responses[key]);
                }
            }
            const myKey = currentUser.toLowerCase();
            if (data.responses && data.responses[myKey]) {
                document.getElementById('dailyNoteInput').value = data.responses[myKey];
            }
            if (data.responses && data.responses[partnerKey]) {
                document.getElementById('dailyNotePartnerLabel').textContent = partnerKey.toUpperCase() + ' wrote:';
                document.getElementById('dailyNotePartnerText').textContent = data.responses[partnerKey];
                partnerSection.style.display = 'block';
            } else {
                partnerSection.style.display = 'none';
            }
        } else {
            partnerSection.style.display = 'none';
        }
    });
}

function closeDailyNoteModal() { document.getElementById('dailyNoteModal').style.display = 'none'; }

async function submitDailyNote() {
    const rawText = document.getElementById('dailyNoteInput').value.trim();
    if (!rawText) { showToast('Write something first'); return; }
    const todayKey = getTodayKey();
    const myKey = currentUser.toLowerCase();
    try {
        const encText = isEncryptionSetup ? await encryptText(rawText) : rawText;
        await fdb.collection(DAILY_NOTES_COLLECTION).doc(todayKey).set({
            prompt: getDailyPrompt(),
            [`responses.${myKey}`]: encText,
            encrypted: isEncryptionSetup,
            date: todayKey,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        closeDailyNoteModal();
        showToast('Love note sent!');
    } catch (e) { console.error('Submit daily note failed:', e); showToast('Failed to send note'); }
}

// ============ PROFILE ============

function renderProfile() {
    if (!currentUser) return;
    const lower = currentUser.toLowerCase();
    const avatarClass = `user-${lower}`;
    const container = document.getElementById('profileContent');

    const encStatus = isEncryptionSetup
        ? '<div class="profile-enc-status enc-on"><i class="fas fa-shield-halved"></i> Encrypted</div>'
        : '<div class="profile-enc-status enc-off"><i class="fas fa-lock-open"></i> Not encrypted</div>';

    const myMood = allMoodsCache[currentUser.toLowerCase()];
    let moodHtml = '<span style="color:var(--text-light)">Not set</span>';
    if (myMood && myMood.mood) {
        const moodInfo = MOOD_MAP[myMood.mood];
        moodHtml = `${moodInfo.emoji} ${moodInfo.text}`;
    }

    container.innerHTML = `
        <div class="profile-card">
            <div class="profile-avatar-large ${avatarClass}">${currentUser}</div>
            <div class="profile-name">${escapeHtml(currentUser)}</div>
            <div class="profile-joined">Member of LoveLore</div>
            <button class="anni-edit-btn" id="editAnniversaryBtn" onclick="openAnniversaryEditor()">
                <i class="fas fa-calendar-heart"></i> Set Anniversary
            </button>
            <div class="profile-stats">
                <div class="profile-stat">
                    <div class="profile-stat-number" id="profilePostCount">0</div>
                    <div class="profile-stat-label">Posts</div>
                </div>
                <div class="profile-stat">
                    <div class="profile-stat-number" id="profileLikeCount">0</div>
                    <div class="profile-stat-label">Reactions</div>
                </div>
            </div>
            <div class="profile-mood-section">
                <div class="profile-mood-current">Mood: ${moodHtml}</div>
                <button class="profile-mood-btn" onclick="openMoodSetter()"><i class="fas fa-face-smile"></i> Change Mood</button>
            </div>
            <div class="profile-enc-section">${encStatus}</div>
        </div>
        <div class="profile-section-title">My Posts</div>
        <div id="profileGrid" class="profile-grid"></div>
        <div id="profileEmptyPosts" class="profile-empty-posts">No posts yet. Share your first moment!</div>`;
    loadProfileStats();
}

function loadProfileStats() {
    fdb.collection(POSTS_COLLECTION)
        .where('author', '==', currentUser)
        .orderBy('createdAt', 'desc')
        .onSnapshot(async snapshot => {
            let postCount = 0, reactionCount = 0;
            const imagePosts = [];
            for (const doc of snapshot.docs) {
                const data = doc.data();
                postCount++;
                reactionCount += (data.reactions ? Object.keys(data.reactions).length : 0);
                if (data.imageData) {
                    if (isEncryptionSetup) {
                        data.imageData = await decryptField(data.imageData, doc.id, 'imageData');
                    }
                    imagePosts.push(data);
                }
            }
            const postEl = document.getElementById('profilePostCount');
            const likeEl = document.getElementById('profileLikeCount');
            if (postEl) postEl.textContent = postCount;
            if (likeEl) likeEl.textContent = reactionCount;
            const grid = document.getElementById('profileGrid');
            const emptyEl = document.getElementById('profileEmptyPosts');
            if (!grid) return;
            if (imagePosts.length > 0) {
                grid.innerHTML = imagePosts.map(p => `
                    <div class="profile-grid-item" data-image="${p.imageData}">
                        <img src="${p.imageData}" alt="Post" loading="lazy"></div>`).join('');
                grid.style.display = 'grid';
                if (emptyEl) emptyEl.style.display = 'none';
                grid.querySelectorAll('.profile-grid-item').forEach(item => {
                    item.addEventListener('click', () => openImageViewer(item.dataset.image));
                });
            } else {
                grid.style.display = 'none';
                if (emptyEl) emptyEl.style.display = 'block';
            }
        });
}

// ============ ANNIVERSARY COUNTER ============

function loadAnniversary() {
    fdb.collection(SETTINGS_COLLECTION).doc('anniversary').onSnapshot(doc => {
        if (doc.exists && doc.data().date) { renderAnniversary(doc.data().date); }
        else { document.getElementById('anniversaryBanner').style.display = 'none'; }
    });
}

function renderAnniversary(dateStr) {
    const anniversary = new Date(dateStr);
    const now = new Date();
    const diffMs = now - anniversary;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const dateFormatted = anniversary.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    document.getElementById('anniDays').textContent = days;
    document.getElementById('anniDate').textContent = 'Since ' + dateFormatted;
    document.getElementById('anniversaryBanner').style.display = 'block';
}

async function setAnniversary(dateStr) {
    try {
        await fdb.collection(SETTINGS_COLLECTION).doc('anniversary').set({ date: dateStr, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
        showToast('Anniversary saved!');
    } catch (e) { console.error('Save anniversary failed:', e); showToast('Failed to save anniversary'); }
}

function openAnniversaryEditor() {
    const existing = document.getElementById('anniversaryEditorModal');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'anniversaryEditorModal';
    overlay.className = 'modal-overlay';
    overlay.style.display = 'flex';
    overlay.innerHTML = `
        <div class="modal-sheet" style="max-height:50vh">
            <div class="modal-handle"></div>
            <div class="modal-header">
                <h2><i class="fas fa-heart" style="color:var(--primary);margin-right:8px"></i>Our Anniversary</h2>
                <button class="modal-close" onclick="document.getElementById('anniversaryEditorModal').remove()"><i class="fas fa-times"></i></button>
            </div>
            <div style="padding:0 20px 20px;text-align:center">
                <p style="color:var(--text-secondary);font-size:14px;margin-bottom:16px">When did your love story begin?</p>
                <input type="datetime-local" id="anniDateInput" class="input-field" style="padding-left:16px;text-align:center;font-size:16px">
                <button class="btn-primary" style="margin-top:16px" onclick="saveAnniversaryFromEditor()"><i class="fas fa-heart"></i> Save</button>
            </div>
        </div>`;
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
}

async function saveAnniversaryFromEditor() {
    const input = document.getElementById('anniDateInput');
    if (!input || !input.value) { showToast('Please select a date'); return; }
    await setAnniversary(input.value);
    document.getElementById('anniversaryEditorModal').remove();
}

// ============ NAVIGATION ============

function switchScreen(screenId) {
    document.querySelectorAll('.app-screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.nav-btn[data-screen="${screenId}"]`).classList.add('active');
    document.getElementById('fabCreate').style.display = screenId === 'feedScreen' ? 'flex' : 'none';
}

// ============ UI HELPERS ============

function updateSyncDot(status) {
    const dot = document.getElementById('syncDot');
    if (!dot) return;
    dot.className = 'sync-dot ' + status;
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.display = 'block';
    toast.style.animation = 'none';
    void toast.offsetWidth;
    toast.style.animation = 'toastIn 0.3s ease-out';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => { toast.style.display = 'none'; }, 2500);
}

function timeAgo(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + 'm ago';
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + 'h ago';
    const days = Math.floor(hours / 24);
    if (days < 7) return days + 'd ago';
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return weeks + 'w ago';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============ SERVICE WORKER REGISTRATION ============

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(e => {
            console.warn('SW registration failed:', e);
        });
    });
}
