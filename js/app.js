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
const COUNTDOWNS_COLLECTION = 'social_countdowns';
const DAILY_NOTES_COLLECTION = 'social_daily_notes';
const MESSAGES_COLLECTION = 'social_messages';
const CHAT_META_COLLECTION = 'social_chat_meta';
const LETTERS_COLLECTION = 'social_letters';
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

const CHAT_THEMES = {
    default: { label: 'Default', sent: '#6C5CE7', received: '#EFEFEF', bg: '#fff', sentGrad: 'linear-gradient(135deg, #6C5CE7, #a855f7)' },
    love: { label: 'Love', sent: '#FF6B8A', received: '#FFE0E8', bg: 'linear-gradient(180deg, #FFF0F3 0%, #FFE0E8 50%, #FFF5F7 100%)', sentGrad: 'linear-gradient(135deg, #FF6B8A, #FF8FA3)' },
    ocean: { label: 'Ocean', sent: '#2196F3', received: '#D0EAFB', bg: 'linear-gradient(180deg, #E8F4FD 0%, #D0EAFB 50%, #E8F4FD 100%)', sentGrad: 'linear-gradient(135deg, #2196F3, #42A5F5)' },
    sunset: { label: 'Sunset', sent: '#FF9800', received: '#FFE0B2', bg: 'linear-gradient(180deg, #FFF3E0 0%, #FFE0B2 50%, #FFF3E0 100%)', sentGrad: 'linear-gradient(135deg, #FF9800, #FFB74D)' },
    forest: { label: 'Forest', sent: '#4CAF50', received: '#C8E6C9', bg: 'linear-gradient(180deg, #E8F5E9 0%, #C8E6C9 50%, #E8F5E9 100%)', sentGrad: 'linear-gradient(135deg, #4CAF50, #66BB6A)' },
    midnight: { label: 'Midnight', sent: '#6C5CE7', received: '#2A2A4A', bg: 'linear-gradient(180deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)', sentGrad: 'linear-gradient(135deg, #6C5CE7, #a855f7)' },
    lavender: { label: 'Lavender', sent: '#9C27B0', received: '#E1BEE7', bg: 'linear-gradient(180deg, #F3E5F5 0%, #E1BEE7 50%, #F3E5F5 100%)', sentGrad: 'linear-gradient(135deg, #9C27B0, #BA68C8)' },
    cherry: { label: 'Cherry', sent: '#E91E63', received: '#F8BBD0', bg: 'linear-gradient(180deg, #FCE4EC 0%, #F8BBD0 50%, #FCE4EC 100%)', sentGrad: 'linear-gradient(135deg, #E91E63, #F06292)' },
    cotton: { label: 'Cotton Candy', sent: '#00ACC1', received: '#B2EBF2', bg: 'linear-gradient(180deg, #E0F7FA 0%, #B2EBF2 50%, #E0F7FA 100%)', sentGrad: 'linear-gradient(135deg, #00ACC1, #26C6DA)' }
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
let currentPostForComments = null;
let pendingImageData = null;
let selectedUser = null;
let lastTapTime = 0;
let lastTapPostId = null;
let allPostsCache = [];
let chatUnsubscribe = null;
let chatMetaUnsubscribe = null;
let chatSearchMode = false;
let replyingTo = null;
let isRecordingVoice = false;
let mediaRecorder = null;
let voiceChunks = [];
let voiceRecordingTimer = null;
let voiceRecordingSeconds = 0;
let chatLongPressTimer = null;
let selectedChatMsgId = null;
let typingTimeout = null;
let chatScrolledToBottom = true;
let allChatMessages = [];
let lettersUnsubscribe = null;
let letterImageData = null;
let _lastTouchEndTime = 0; // Prevent synthetic mouse events from triggering double-tap
let currentChatTheme = localStorage.getItem('lovelore_chat_theme') || 'default';

// ---- Encryption State ----
let encryptionKey = null;
let isEncryptionSetup = false;
const _decryptCache = new Map();

// ============ OFFLINE CACHE (IndexedDB) ============

const OFFLINE_DB = 'lovelore_offline';
const OFFLINE_STORE = 'cached_data';
const QUEUE_STORE = 'write_queue';

function openOfflineDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(OFFLINE_DB, 2);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(OFFLINE_STORE)) db.createObjectStore(OFFLINE_STORE);
            if (!db.objectStoreNames.contains(QUEUE_STORE)) db.createObjectStore(QUEUE_STORE, { autoIncrement: true });
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function cacheData(key, data) {
    try {
        const db = await openOfflineDB();
        const tx = db.transaction(OFFLINE_STORE, 'readwrite');
        tx.objectStore(OFFLINE_STORE).put(data, key);
        await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = rej; });
    } catch (e) { console.warn('Cache write failed:', e); }
}

async function getCachedData(key) {
    try {
        const db = await openOfflineDB();
        const tx = db.transaction(OFFLINE_STORE, 'readonly');
        return new Promise((resolve) => {
            const req = tx.objectStore(OFFLINE_STORE).get(key);
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => resolve(null);
        });
    } catch (e) { return null; }
}

async function queueWrite(operation) {
    try {
        const db = await openOfflineDB();
        const tx = db.transaction(QUEUE_STORE, 'readwrite');
        tx.objectStore(QUEUE_STORE).add({ ...operation, queuedAt: Date.now() });
        await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = rej; });
        showOfflineBanner();
    } catch (e) { console.error('Queue write failed:', e); }
}

async function flushWriteQueue() {
    try {
        const db = await openOfflineDB();
        const tx = db.transaction(QUEUE_STORE, 'readonly');
        const items = await new Promise((resolve) => {
            const req = tx.objectStore(QUEUE_STORE).getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => resolve([]);
        });
        if (items.length === 0) return;
        for (const item of items) {
            try {
                if (item.type === 'post') {
                    await fdb.collection(POSTS_COLLECTION).add(item.data);
                } else if (item.type === 'comment') {
                    await fdb.collection(COMMENTS_COLLECTION).add(item.data);
                    await fdb.collection(POSTS_COLLECTION).doc(item.data.postId).update({
                        commentCount: firebase.firestore.FieldValue.increment(1)
                    });
                }
            } catch (e) { console.error('Flush item failed:', e); }
        }
        // Clear the queue
        const clearTx = db.transaction(QUEUE_STORE, 'readwrite');
        clearTx.objectStore(QUEUE_STORE).clear();
        await new Promise((res, rej) => { clearTx.oncomplete = res; clearTx.onerror = rej; });
        hideOfflineBanner();
        showToast('Synced offline changes!');
    } catch (e) { console.error('Flush queue failed:', e); }
}

function isOnline() { return navigator.onLine; }

function showOfflineBanner() {
    const banner = document.getElementById('offlineBanner');
    if (banner) banner.style.display = 'flex';
}

function hideOfflineBanner() {
    const banner = document.getElementById('offlineBanner');
    if (banner) banner.style.display = 'none';
}

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
        return 'ENC:' + uint8ToBase64(combined);
    } catch (e) { console.error('Encrypt failed:', e); return plaintext; }
}

async function decryptText(ciphertext) {
    if (!ciphertext || !ciphertext.startsWith('ENC:')) return ciphertext;
    try {
        const combined = base64ToUint8(ciphertext.substring(4));
        const iv = combined.slice(0, 12);
        const data = combined.slice(12);
        const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, encryptionKey, data);
        return new TextDecoder().decode(decrypted);
    } catch (e) { console.error('Decrypt failed:', e); return ciphertext; }
}

// Fast Uint8Array → base64 (handles large data without call stack overflow)
function uint8ToBase64(bytes) {
    const lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    const len = bytes.length;
    for (let i = 0; i < len; i += 3) {
        const a = bytes[i];
        const b = i + 1 < len ? bytes[i + 1] : 0;
        const c = i + 2 < len ? bytes[i + 2] : 0;
        result += lookup[a >> 2] + lookup[((a & 3) << 4) | (b >> 4)];
        result += (i + 1 < len) ? lookup[((b & 15) << 2) | (c >> 6)] : '=';
        result += (i + 2 < len) ? lookup[c & 63] : '=';
    }
    return result;
}

// Fast base64 → Uint8Array (handles large data efficiently)
function base64ToUint8(base64) {
    const lookup = new Uint8Array(128);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    for (let i = 0; i < chars.length; i++) lookup[chars.charCodeAt(i)] = i;

    const len = base64.length;
    let byteLen = len * 3 / 4;
    if (base64[len - 1] === '=') byteLen--;
    if (base64[len - 2] === '=') byteLen--;

    const bytes = new Uint8Array(byteLen);
    let pos = 0;
    for (let i = 0; i < len; i += 4) {
        const a = lookup[base64.charCodeAt(i)];
        const b = lookup[base64.charCodeAt(i + 1)];
        const c = lookup[base64.charCodeAt(i + 2)];
        const d = lookup[base64.charCodeAt(i + 3)];
        bytes[pos++] = (a << 2) | (b >> 4);
        if (pos < byteLen) bytes[pos++] = ((b & 15) << 4) | (c >> 2);
        if (pos < byteLen) bytes[pos++] = ((c & 3) << 6) | d;
    }
    return bytes;
}

async function decryptField(ciphertext, docId, field) {
    if (!ciphertext || !ciphertext.startsWith('ENC:')) return ciphertext;
    const cacheKey = `${docId}:${field}`;
    if (_decryptCache.has(cacheKey)) return _decryptCache.get(cacheKey);
    const result = await decryptText(ciphertext);
    if (_decryptCache.size > 200) { const k = _decryptCache.keys().next().value; _decryptCache.delete(k); }
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
    setupAutoUpdate();
});

// ---- Auto Update: Listen for service worker updates ----
function setupAutoUpdate() {
    // When SW detects a new version, auto-reload to apply it
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'SW_UPDATED') {
                console.log('New version available, reloading...');
                // Only reload if user is not typing (don't interrupt)
                const activeEl = document.activeElement;
                const isTyping = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');
                if (!isTyping) {
                    window.location.reload();
                } else {
                    // Show a subtle toast instead
                    showToast('Update available — refresh to get the latest version');
                }
            }
        });

        // Also check for SW updates every 30 minutes
        setInterval(() => {
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({ type: 'CHECK_UPDATE' });
            }
        }, 30 * 60 * 1000);
    }
}

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
    window.addEventListener('online', () => { updateSyncDot('synced'); flushWriteQueue(); });
    window.addEventListener('offline', () => { updateSyncDot('offline'); showOfflineBanner(); });
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
    // Daily note modal: close + send + banner click
    document.getElementById('closeDailyNoteModal').addEventListener('click', closeDailyNoteModal);
    document.getElementById('sendDailyNoteBtn').addEventListener('click', submitDailyNote);
    document.getElementById('dailyNoteBanner').addEventListener('click', openDailyNoteModal);
    // Close modals on overlay click
    ['capsuleCreateModal', 'capsuleViewModal', 'countdownModal', 'dailyNoteModal'].forEach(id => {
        document.getElementById(id).addEventListener('click', e => { if (e.target === e.currentTarget) e.target.style.display = 'none'; });
    });
    // Chat event listeners
    document.getElementById('chatInput').addEventListener('input', () => { updateChatSendBtn(); handleChatTyping(); });
    document.getElementById('chatSendBtn').addEventListener('click', sendChatMessage);
    document.getElementById('chatInput').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); sendChatMessage(); } });
    document.getElementById('chatEmojiBtn').addEventListener('click', () => {
        const picker = document.getElementById('emojiPicker');
        picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
    });
    document.getElementById('chatAttachBtn').addEventListener('click', () => document.getElementById('chatImageInput').click());
    document.getElementById('chatImageInput').addEventListener('change', e => { if (e.target.files[0]) sendChatImage(e.target.files[0]); e.target.value = ''; });
    document.getElementById('chatVoiceBtn').addEventListener('click', startVoiceRecording);
    // Chat theme button
    document.getElementById('chatThemeBtn').addEventListener('click', openChatThemeModal);
    document.getElementById('closeChatTheme').addEventListener('click', () => {
        document.getElementById('chatThemeModal').style.display = 'none';
    });
    document.getElementById('chatThemeModal').addEventListener('click', e => {
        if (e.target === e.currentTarget) e.target.style.display = 'none';
    });
    document.getElementById('chatSearchBtn').addEventListener('click', openChatSearch);
    document.getElementById('chatSearchBack').addEventListener('click', closeChatSearch);
    document.getElementById('chatSearchInput').addEventListener('input', e => searchChatMessages(e.target.value));
    document.getElementById('chatNewMsgBtn').addEventListener('click', scrollChatToBottom);
    document.getElementById('chatReplyCancel').addEventListener('click', cancelReply);
    // Voice recording
    document.getElementById('voiceRecCancel').addEventListener('click', () => stopVoiceRecording(false));
    document.getElementById('voiceRecSend').addEventListener('click', () => stopVoiceRecording(true));
    // Context menu
    document.getElementById('ctxReplyBtn').addEventListener('click', e => {
        e.stopPropagation();
        if (selectedChatMsgId) replyToMessage(selectedChatMsgId);
    });
    document.getElementById('ctxReactBtn').addEventListener('click', e => {
        e.stopPropagation();
        document.getElementById('chatContextMenu').style.display = 'none';
        const picker = document.getElementById('chatReactionPicker');
        picker.style.display = 'flex';
        picker.style.left = '50%';
        picker.style.transform = 'translateX(-50%)';
        picker.style.bottom = '120px';
        picker.style.top = 'auto';
    });
    document.getElementById('ctxDeleteBtn').addEventListener('click', e => {
        e.stopPropagation();
        if (selectedChatMsgId) deleteChatMessage(selectedChatMsgId);
    });
    // Chat reaction picker clicks
    document.querySelectorAll('#chatReactionPicker .reaction-opt').forEach(opt => {
        opt.addEventListener('click', e => {
            e.stopPropagation();
            if (selectedChatMsgId) addChatReaction(selectedChatMsgId, opt.dataset.reaction);
            document.getElementById('chatReactionPicker').style.display = 'none';
        });
    });
    // Emoji picker clicks
    document.querySelectorAll('#emojiPicker .emoji-pick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = document.getElementById('chatInput');
            input.value += btn.dataset.emoji;
            input.focus();
            updateChatSendBtn();
            document.getElementById('emojiPicker').style.display = 'none';
        });
    });
    // Close menus on outside click - with delay to prevent race conditions
    document.addEventListener('click', e => {
        const ctxMenu = document.getElementById('chatContextMenu');
        if (ctxMenu.style.display !== 'none' && !ctxMenu.contains(e.target) && !e.target.closest('.chat-msg')) ctxMenu.style.display = 'none';
        const chatReactPicker = document.getElementById('chatReactionPicker');
        if (chatReactPicker.style.display !== 'none' && !chatReactPicker.contains(e.target) && !e.target.closest('#ctxReactBtn') && !e.target.closest('.reaction-opt')) chatReactPicker.style.display = 'none';
        const emojiPicker = document.getElementById('emojiPicker');
        if (emojiPicker.style.display !== 'none' && !emojiPicker.contains(e.target) && !e.target.closest('#chatEmojiBtn')) emojiPicker.style.display = 'none';
    });
    // Chat back button
    document.getElementById('chatBackBtn').addEventListener('click', () => switchScreen('feedScreen'));
    // Letters
    document.getElementById('addLetterBtn').addEventListener('click', openLetterCreateModal);
    document.getElementById('closeLetterCreate').addEventListener('click', closeLetterCreateModal);
    document.getElementById('createLetterBtn').addEventListener('click', createLetter);
    document.getElementById('letterImageInput').addEventListener('change', handleLetterImageSelect);
    document.getElementById('removeLetterImage').addEventListener('click', removeLetterImage);
    document.getElementById('closeLetterView').addEventListener('click', closeLetterViewModal);
    // Letter modals overlay click
    ['letterCreateModal', 'letterViewModal'].forEach(id => {
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
    postsUnsubscribe = null; commentsUnsubscribe = null;
    capsulesUnsubscribe = null; countdownsUnsubscribe = null;
    if (chatUnsubscribe) chatUnsubscribe();
    if (chatMetaUnsubscribe) chatMetaUnsubscribe();
    if (lettersUnsubscribe) lettersUnsubscribe();
    chatUnsubscribe = null; chatMetaUnsubscribe = null;
    lettersUnsubscribe = null;
    updateOnlineStatus(false);
    allChatMessages = [];
    replyingTo = null;
    currentUser = null; selectedUser = null; allPostsCache = [];
    encryptionKey = null; isEncryptionSetup = false;
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
    // Show cached data immediately while waiting for Firebase
    (async () => {
        const cachedPosts = await getCachedData('posts');
        if (cachedPosts && cachedPosts.length > 0) {
            allPostsCache = cachedPosts;
            renderFeed(cachedPosts);
            renderGallery(cachedPosts);
            renderTimeline(cachedPosts);
        }
    })();
    attachPostsListener();
    attachCapsulesListener();
    attachCountdownsListener();
    loadAnniversary();
    loadDailyNote();
    renderProfile();
    attachChatListener();
    attachChatMetaListener();
    loadChatTheme();
    updateOnlineStatus(true);
    attachLettersListener();
    // Show offline banner if currently offline
    if (!isOnline()) showOfflineBanner();
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
            // Cache for offline access
            cacheData('posts', posts.map(p => ({ ...p, createdAt: p.createdAt ? (p.createdAt.toDate ? p.createdAt.toDate().toISOString() : p.createdAt) : null })));
            document.getElementById('feedLoader').style.display = 'none';
            updateSyncDot('synced');
            hideOfflineBanner();
        }, async error => {
            console.error('Posts listener error:', error);
            // Try loading from offline cache
            const cached = await getCachedData('posts');
            if (cached && cached.length > 0) {
                allPostsCache = cached;
                renderFeed(cached);
                renderGallery(cached);
                renderTimeline(cached);
                showOfflineBanner();
            }
            document.getElementById('feedLoader').style.display = 'none';
            updateSyncDot(isOnline() ? 'error' : 'offline');
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
    // Delete buttons
    container.querySelectorAll('.post-delete-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const confirmBar = container.querySelector(`.post-delete-confirm[data-post-id="${btn.dataset.postId}"]`);
            if (confirmBar) confirmBar.style.display = 'flex';
        });
    });
    container.querySelectorAll('.confirm-del-yes').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            deletePost(btn.dataset.postId);
        });
    });
    container.querySelectorAll('.confirm-del-no').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const confirmBar = container.querySelector(`.post-delete-confirm[data-post-id="${btn.dataset.postId}"]`);
            if (confirmBar) confirmBar.style.display = 'none';
        });
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

    const deleteBtn = post.author === currentUser
        ? `<button class="post-delete-btn" data-post-id="${post.id}" title="Delete post"><i class="fas fa-trash-alt"></i></button>`
        : '';

    return `
        <div class="post-card" data-post-id="${post.id}">
            <div class="post-header">
                <div class="post-avatar ${avatarClass}">${post.author || '?'}</div>
                <div class="post-user-info">
                    <div class="post-author">${escapeHtml(post.author || 'Unknown')}</div>
                    <div class="post-time">${timeStr}</div>
                </div>
                ${deleteBtn}
            </div>
            ${imageHtml}
            ${textHtml}
            <div class="post-actions">
                <button class="post-action-btn react-btn" data-post-id="${post.id}" data-post-author="${post.author}">${reactIcon}</button>
                <button class="post-action-btn comment-btn" data-post-id="${post.id}"><i class="far fa-comment"></i></button>
            </div>
            ${reactionSummaryHtml}
            ${commentPreview}
            <div class="post-delete-confirm" data-post-id="${post.id}" style="display:none">
                <span>Delete this post?</span>
                <button class="confirm-del-yes" data-post-id="${post.id}">Delete</button>
                <button class="confirm-del-no" data-post-id="${post.id}">Cancel</button>
            </div>
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
        const commentData = {
            postId: currentPostForComments, author: currentUser,
            text: encText, encrypted: isEncryptionSetup,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        if (isOnline()) {
            await fdb.collection(COMMENTS_COLLECTION).add(commentData);
            await fdb.collection(POSTS_COLLECTION).doc(currentPostForComments).update({
                commentCount: firebase.firestore.FieldValue.increment(1)
            });
        } else {
            queueWrite({ type: 'comment', data: { ...commentData, createdAt: new Date().toISOString() } });
            showToast('Comment saved offline');
        }
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
        const postData = {
            author: currentUser, text: encText, imageData: encImage,
            encrypted: isEncryptionSetup, reactions: {}, commentCount: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        if (isOnline()) {
            await fdb.collection(POSTS_COLLECTION).add(postData);
        } else {
            // Queue for later, show immediately
            queueWrite({ type: 'post', data: { ...postData, createdAt: new Date().toISOString() } });
            const tempPost = {
                id: 'pending_' + Date.now(), author: currentUser,
                text: rawText, imageData: pendingImageData,
                reactions: {}, commentCount: 0,
                createdAt: new Date()
            };
            allPostsCache.unshift(tempPost);
            renderFeed(allPostsCache);
        }
        closeCreatePostModal();
        showToast(isOnline() ? 'Posted!' : 'Saved offline — will sync when online');
    } catch (e) {
        console.error('Create post failed:', e);
        showToast('Failed to post. Try again.');
        btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane"></i> Post';
    }
}

// ============ DELETE POST ============

async function deletePost(postId) {
    try {
        // Delete all comments for this post first
        const commentsSnapshot = await fdb.collection(COMMENTS_COLLECTION)
            .where('postId', '==', postId).get();
        const batch = fdb.batch();
        commentsSnapshot.forEach(doc => batch.delete(doc.ref));
        // Delete the post itself
        batch.delete(fdb.collection(POSTS_COLLECTION).doc(postId));
        await batch.commit();
        showToast('Post deleted');
    } catch (e) {
        console.error('Delete post failed:', e);
        showToast('Failed to delete post');
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
            cacheData('capsules', capsules);
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
        .onSnapshot(async snapshot => {
            const countdowns = [];
            for (const doc of snapshot.docs) {
                const data = doc.data();
                if (isEncryptionSetup) {
                    if (data.name) data.name = await decryptField(data.name, doc.id, 'name');
                }
                countdowns.push({ id: doc.id, ...data });
            }
            renderCountdowns(countdowns);
            cacheData('countdowns', countdowns);
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
            author: currentUser, name: isEncryptionSetup ? await encryptText(name) : name, targetDate, emoji,
            encrypted: isEncryptionSetup,
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
            <div class="profile-enc-section">${encStatus}</div>
        </div>
        <div class="profile-shortcuts" style="display:flex;gap:8px;margin-bottom:16px;">
            <button class="profile-btn" onclick="switchScreen('timelineScreen')" style="flex:1;justify-content:center"><i class="fas fa-clock-rotate-left"></i> Timeline</button>
            <button class="profile-btn" onclick="switchScreen('galleryScreen')" style="flex:1;justify-content:center"><i class="fas fa-images"></i> Gallery</button>
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
    fdb.collection(SETTINGS_COLLECTION).doc('anniversary').onSnapshot(async doc => {
        if (doc.exists && doc.data().date) { renderAnniversary(doc.data().date); }
        else {
            // Try offline cache
            const cached = await getCachedData('anniversary');
            if (cached) { renderAnniversary(cached); }
            else { document.getElementById('anniversaryBanner').style.display = 'none'; }
        }
    }, async error => {
        console.error('Anniversary listener error:', error);
        const cached = await getCachedData('anniversary');
        if (cached) { renderAnniversary(cached); }
    });
}

function renderAnniversary(dateStr) {
    cacheData('anniversary', dateStr);
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
    const navBtn = document.querySelector(`.nav-btn[data-screen="${screenId}"]`);
    if (navBtn) navBtn.classList.add('active');
    document.getElementById('fabCreate').style.display = screenId === 'feedScreen' ? 'flex' : 'none';
    const topBar = document.querySelector('.top-bar');
    const bottomNav = document.querySelector('.bottom-nav');
    const offlineBanner = document.getElementById('offlineBanner');
    if (screenId === 'chatScreen') {
        if (topBar) topBar.style.display = 'none';
        if (bottomNav) bottomNav.classList.add('chat-hidden');
        if (offlineBanner) offlineBanner.style.display = 'none';
        // Scroll to bottom when opening chat (Instagram opens at newest messages)
        setTimeout(() => {
            scrollChatToBottom();
            markMessagesAsRead();
        }, 100);
    } else {
        if (topBar) topBar.style.display = 'flex';
        if (bottomNav) bottomNav.classList.remove('chat-hidden');
        // Stop voice playback when leaving chat
        if (_currentVoiceAudio) {
            _currentVoiceAudio.pause();
            _currentVoiceAudio = null;
            _currentVoiceMsgId = null;
            clearInterval(_voicePlayInterval);
        }
    }
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

// ============ CHAT SYSTEM ============

// ---- Chat Listener ----
function attachChatListener() {
    if (chatUnsubscribe) chatUnsubscribe();
    chatUnsubscribe = fdb.collection(MESSAGES_COLLECTION)
        .orderBy('createdAt', 'asc')
        .onSnapshot(async snapshot => {
            const msgs = [];
            for (const doc of snapshot.docs) {
                const data = doc.data();
                if (data.deleted) { msgs.push({ id: doc.id, ...data }); continue; }
                if (isEncryptionSetup) {
                    if (data.text) data.text = await decryptField(data.text, doc.id, 'text');
                    if (data.imageData) data.imageData = await decryptField(data.imageData, doc.id, 'imageData');
                    if (data.voiceData) data.voiceData = await decryptField(data.voiceData, doc.id, 'voiceData');
                    if (data.replyToText) data.replyToText = await decryptField(data.replyToText, doc.id, 'replyToText');
                }
                msgs.push({ id: doc.id, ...data });
            }
            allChatMessages = msgs;
            renderChatMessages(msgs);
            markMessagesAsRead();
        }, error => console.error('Chat listener error:', error));
}

// ---- Chat Meta Listener (online status + typing) ----
function attachChatMetaListener() {
    if (chatMetaUnsubscribe) chatMetaUnsubscribe();
    chatMetaUnsubscribe = fdb.collection(CHAT_META_COLLECTION).doc('status')
        .onSnapshot(doc => {
            if (!doc.exists) return;
            const data = doc.data();
            const partner = currentUser === 'A' ? 'p' : 'a';
            const partnerUpper = partner.toUpperCase();

            // Update partner online status with heartbeat check
            const avatar = document.getElementById('chatPartnerAvatar');
            const statusEl = document.getElementById('chatPartnerStatus');
            if (avatar) {
                avatar.className = `chat-partner-avatar user-${partner}`;
                avatar.textContent = partnerUpper;
                // Remove existing dot
                const existingDot = avatar.querySelector('.online-dot');
                if (existingDot) existingDot.remove();

                // Determine if partner is truly online
                let partnerIsOnline = false;
                if (data[partner] && data[partner].isOnline) {
                    // Check heartbeat: if lastSeen is older than 90s, they're actually offline
                    const ls = data[partner].lastSeen ? (data[partner].lastSeen.toDate ? data[partner].lastSeen.toDate() : new Date(data[partner].lastSeen)) : null;
                    if (ls && (Date.now() - ls.getTime() < 90000)) {
                        partnerIsOnline = true;
                    }
                }

                if (partnerIsOnline) {
                    const dot = document.createElement('div');
                    dot.className = 'online-dot online';
                    avatar.appendChild(dot);
                    if (statusEl) { statusEl.textContent = 'online'; statusEl.className = 'chat-partner-status online-status'; }
                } else {
                    if (data[partner] && data[partner].lastSeen) {
                        const ls = data[partner].lastSeen.toDate ? data[partner].lastSeen.toDate() : new Date(data[partner].lastSeen);
                        if (statusEl) { statusEl.textContent = 'last seen ' + timeAgo(ls); statusEl.className = 'chat-partner-status'; }
                    } else {
                        if (statusEl) { statusEl.textContent = 'offline'; statusEl.className = 'chat-partner-status'; }
                    }
                }
            }

            // Update typing indicator
            const typingKey = 'typing' + partner.toUpperCase();
            const typingUpdateKey = 'typingUpdatedAt' + partner.toUpperCase();
            if (data[typingKey] && data[typingUpdateKey]) {
                const typingTime = data[typingUpdateKey].toDate ? data[typingUpdateKey].toDate() : new Date(data[typingUpdateKey]);
                const diff = Date.now() - typingTime.getTime();
                if (diff < 4000) {
                    if (statusEl) {
                        statusEl.innerHTML = 'typing<span class="typing-dots"><span></span><span></span><span></span></span>';
                        statusEl.className = 'chat-partner-status typing';
                    }
                } else {
                    // Clear stale typing
                    setPartnerTypingState(false);
                }
            }
        }, error => console.error('Chat meta listener error:', error));
}

function setPartnerTypingState(isTyping) {
    const statusEl = document.getElementById('chatPartnerStatus');
    if (!statusEl) return;
    if (!isTyping) {
        // Restore online/offline status
        const avatar = document.getElementById('chatPartnerAvatar');
        const dot = avatar ? avatar.querySelector('.online-dot') : null;
        if (dot) { statusEl.textContent = 'online'; statusEl.className = 'chat-partner-status online-status'; }
        else { statusEl.textContent = 'offline'; statusEl.className = 'chat-partner-status'; }
    }
}

// ---- Render Chat Messages (Instagram-style with grouping) ----
function renderChatMessages(messages) {
    const container = document.getElementById('chatMessages');
    const emptyEl = document.getElementById('chatEmpty');
    if (!messages || messages.length === 0) {
        container.innerHTML = '';
        if (emptyEl) emptyEl.style.display = 'flex';
        return;
    }
    if (emptyEl) emptyEl.style.display = 'none';

    // Check if we should auto-scroll
    // If chat is not currently visible (switching to chat tab), always scroll to bottom
    const isChatVisible = document.getElementById('chatScreen').classList.contains('active');
    const wasAtBottom = !isChatVisible || container.scrollHeight - container.scrollTop - container.clientHeight < 80;

    let html = '';
    let lastDate = null;
    let prevMsg = null;
    let prevMsgSameAuthor = false;

    messages.forEach((msg, idx) => {
        const msgDate = msg.createdAt ? (msg.createdAt.toDate ? msg.createdAt.toDate() : new Date(msg.createdAt)) : new Date();
        const dateStr = msgDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        // Date separator (Instagram-style pill)
        if (dateStr !== lastDate) {
            html += `<div class="chat-date-sep"><span>${dateStr}</span></div>`;
            lastDate = dateStr;
            prevMsgSameAuthor = false;
        }

        // Message grouping logic
        const nextMsg = idx < messages.length - 1 ? messages[idx + 1] : null;
        const sameAuthorAsPrev = prevMsg && prevMsg.author === msg.author && !prevMsg.deleted;
        const sameAuthorAsNext = nextMsg && nextMsg.author === msg.author && !msg.deleted;
        const sameDateAsNext = nextMsg ? (nextMsg.createdAt ? (nextMsg.createdAt.toDate ? nextMsg.createdAt.toDate() : new Date(nextMsg.createdAt)) : new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) === dateStr : false;

        let groupClass = 'group-single';
        if (sameAuthorAsPrev && sameAuthorAsNext && sameDateAsNext) {
            groupClass = 'group-middle';
        } else if (sameAuthorAsPrev && (!sameAuthorAsNext || !sameDateAsNext)) {
            groupClass = 'group-last';
        } else if (!sameAuthorAsPrev && sameAuthorAsNext && sameDateAsNext) {
            groupClass = 'group-first';
        }

        // Determine if this is the first message in a group (for avatar display)
        const isFirstInGroup = groupClass === 'group-first' || groupClass === 'group-single';
        // Determine if this is the last message in a group (for time display)
        const isLastInGroup = groupClass === 'group-last' || groupClass === 'group-single';

        // Find the last sent message for "Seen" receipt
        const isLastSentByMe = msg.author === currentUser && !msg.deleted &&
            !messages.slice(idx + 1).some(m => m.author === currentUser && !m.deleted);

        html += renderChatBubble(msg, groupClass, isFirstInGroup, isLastInGroup, isLastSentByMe);

        prevMsg = msg;
        prevMsgSameAuthor = sameAuthorAsPrev;
    });

    container.innerHTML = html;

    // Animate new messages (only the last few)
    const msgEls = container.querySelectorAll('.chat-msg');
    const animCount = Math.min(3, msgEls.length);
    for (let i = msgEls.length - animCount; i < msgEls.length; i++) {
        if (i >= 0) msgEls[i].classList.add('msg-appear');
    }

    // Auto-scroll — always scroll to bottom on first load or when near bottom
    if (wasAtBottom) {
        // Use both rAF and a fallback timeout for reliable mobile scrolling
        requestAnimationFrame(() => { container.scrollTop = container.scrollHeight; });
        setTimeout(() => { container.scrollTop = container.scrollHeight; }, 150);
    } else {
        // Show new messages button
        const newMsgBtn = document.getElementById('chatNewMsgBtn');
        if (newMsgBtn) newMsgBtn.style.display = 'flex';
    }

    // Bind events
    bindChatMessageEvents();
}

function renderChatBubble(msg, groupClass, isFirstInGroup, isLastInGroup, isLastSentByMe) {
    const isMine = msg.author === currentUser;
    const cls = isMine ? 'chat-msg-sent' : 'chat-msg-received';
    const time = formatChatTime(msg.createdAt);

    if (msg.deleted) {
        const avatarHtml = (!isMine && isFirstInGroup) ?
            `<div class="chat-msg-avatar user-${msg.author ? msg.author.toLowerCase() : 'p'}">${msg.author || '?'}</div>` :
            (!isMine ? `<div class="chat-msg-avatar invisible">·</div>` : '');
        return `<div class="chat-msg ${cls} ${groupClass}" data-msg-id="${msg.id}" data-msg-author="${msg.author}">
            ${avatarHtml}<div class="chat-bubble"><span class="chat-msg-deleted">Message unavailable</span>
            ${isLastInGroup ? `<div class="chat-msg-meta"><span class="chat-msg-time">${time}</span></div>` : ''}</div></div>`;
    }

    // Avatar for received messages (first in group shows, others invisible spacer)
    let avatarHtml = '';
    if (!isMine) {
        if (isFirstInGroup) {
            avatarHtml = `<div class="chat-msg-avatar user-${msg.author ? msg.author.toLowerCase() : 'p'}">${msg.author || '?'}</div>`;
        } else {
            avatarHtml = `<div class="chat-msg-avatar invisible">·</div>`;
        }
    }

    // Reply reference (Instagram-style)
    let replyHtml = '';
    if (msg.replyTo) {
        const replyAuthor = msg.replyToAuthor || '?';
        const replyText = (msg.replyToText || '').substring(0, 60);
        replyHtml = `<div class="chat-msg-reply-ref">
            <div class="chat-msg-reply-ref-author">${escapeHtml(replyAuthor)}</div>
            <div class="chat-msg-reply-ref-text">${escapeHtml(replyText)}</div></div>`;
    }

    // Content
    let contentHtml = '';
    if (msg.voiceData) {
        contentHtml = renderVoiceMessage(msg.voiceData, isMine, msg.id);
    } else if (msg.imageData) {
        contentHtml = `<img class="chat-bubble-img" src="${msg.imageData}" alt="Photo" onclick="openImageViewer('${msg.imageData.replace(/'/g, "\\'")}')">`;
    }
    if (msg.text) {
        contentHtml += `<div>${escapeHtml(msg.text)}</div>`;
    }

    // "Seen" receipt — Instagram-style: only on the LAST sent message
    let seenHtml = '';
    if (isMine && isLastSentByMe) {
        const readBy = msg.readBy || {};
        const partnerRead = Object.keys(readBy).some(k => k !== currentUser.toLowerCase());
        if (partnerRead) {
            seenHtml = '<span class="chat-msg-seen">Seen</span>';
        }
    }

    // Only show time on last message in group
    const metaHtml = isLastInGroup ?
        `<div class="chat-msg-meta"><span class="chat-msg-time">${time}</span>${seenHtml}</div>` : '';

    // Reactions
    let reactionsHtml = '';
    if (msg.reactions && Object.keys(msg.reactions).length > 0) {
        const counts = {};
        Object.values(msg.reactions).forEach(r => { counts[r] = (counts[r] || 0) + 1; });
        const badges = Object.entries(counts).map(([type, count]) => {
            const info = REACTION_TYPES[type];
            return info ? `<span class="chat-msg-reaction">${info.emoji}${count > 1 ? count : ''}</span>` : '';
        }).join('');
        reactionsHtml = `<div class="chat-msg-reactions">${badges}</div>`;
    }

    return `<div class="chat-msg ${cls} ${groupClass}" data-msg-id="${msg.id}" data-msg-author="${msg.author}">
        ${avatarHtml}<div class="chat-bubble">${replyHtml}${contentHtml}${metaHtml}</div>
        ${reactionsHtml}</div>`;
}

function renderVoiceMessage(voiceData, isMine, msgId) {
    // Instagram-style voice player: play circle, waveform bars, duration
    const bars = Array.from({length: 24}, (_, i) => {
        const h = Math.max(4, Math.sin(i * 0.5) * 12 + Math.random() * 10 + 4);
        return `<div class="chat-voice-bar" style="height:${h}px"></div>`;
    }).join('');
    return `<div class="chat-voice-msg" data-voice-id="${msgId}">
        <button class="chat-voice-play" data-action="play-voice" data-voice-id="${msgId}"><i class="fas fa-play"></i></button>
        <div class="chat-voice-wave">${bars}</div>
        <span class="chat-voice-duration">0:00</span>
    </div>`;
}

// Track currently playing audio so we can stop/restart
let _currentVoiceAudio = null;
let _currentVoiceMsgId = null;
let _voicePlayInterval = null;

function playVoiceMessage(msgId) {
    const msg = allChatMessages.find(m => m.id === msgId);
    if (!msg || !msg.voiceData) { console.warn('No voice data for msg:', msgId); return; }

    // If this message is already playing, pause it
    if (_currentVoiceAudio && _currentVoiceMsgId === msgId) {
        _currentVoiceAudio.pause();
        _currentVoiceAudio.currentTime = 0;
        stopVoicePlayUI(msgId);
        _currentVoiceAudio = null;
        _currentVoiceMsgId = null;
        return;
    }

    // Stop any previously playing voice
    if (_currentVoiceAudio) {
        _currentVoiceAudio.pause();
        _currentVoiceAudio.currentTime = 0;
        stopVoicePlayUI(_currentVoiceMsgId);
        _currentVoiceAudio = null;
        _currentVoiceMsgId = null;
    }

    try {
        let audioSrc = msg.voiceData;

        // If decryption returned the raw ENC: string, it means decryption failed
        if (typeof audioSrc === 'string' && audioSrc.startsWith('ENC:')) {
            console.error('Voice data is still encrypted — decryption failed');
            showToast('Cannot play voice message');
            return;
        }

        // Get the MIME type stored when recording, or detect from data URL
        const voiceMime = msg.voiceMime || '';
        
        // Convert data URL to blob URL for reliable playback (large data URLs fail on mobile)
        const blobUrl = dataUrlToBlobUrl(audioSrc, voiceMime);
        if (!blobUrl) {
            showToast('Cannot play voice message');
            return;
        }

        const audio = new Audio();
        audio.src = blobUrl;
        audio.preload = 'auto';
        _currentVoiceAudio = audio;
        _currentVoiceMsgId = msgId;

        audio.oncanplaythrough = () => {
            audio.play().catch(e => {
                console.error('Voice play() failed:', e);
                showToast('Cannot play voice message');
                _currentVoiceAudio = null;
                _currentVoiceMsgId = null;
            });
        };

        audio.onplay = () => {
            startVoicePlayUI(msgId, audio);
        };
        audio.onended = () => {
            stopVoicePlayUI(msgId);
            _currentVoiceAudio = null;
            _currentVoiceMsgId = null;
        };
        audio.onerror = (e) => {
            console.error('Audio error:', e, 'src type:', audioSrc ? audioSrc.substring(0, 30) : 'null');
            stopVoicePlayUI(msgId);
            _currentVoiceAudio = null;
            _currentVoiceMsgId = null;
            showToast('Cannot play this voice message');
        };

        // Trigger loading
        audio.load();
    } catch(e) {
        console.error('Voice play error:', e);
        showToast('Cannot play voice message');
    }
}

// Convert data URL to blob URL — much more reliable for large audio on mobile
function dataUrlToBlobUrl(dataUrl, fallbackMime) {
    try {
        if (!dataUrl || typeof dataUrl !== 'string') return null;

        // If it's already a blob URL, return as-is
        if (dataUrl.startsWith('blob:')) return dataUrl;

        // Must be a data URL
        if (!dataUrl.startsWith('data:')) {
            // Maybe it's raw base64 without the prefix — use the stored MIME type or default
            const mime = fallbackMime || 'audio/webm';
            dataUrl = 'data:' + mime + ';base64,' + dataUrl;
        }

        const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (!match) {
            console.error('Invalid data URL format');
            return null;
        }

        const mimeType = match[1];
        const base64 = match[2];

        // Use the efficient base64ToUint8 (handles large data without call stack overflow)
        const bytes = base64ToUint8(base64);

        const blob = new Blob([bytes], { type: mimeType });
        return URL.createObjectURL(blob);
    } catch (e) {
        console.error('dataUrlToBlobUrl failed:', e);
        return null;
    }
}

function startVoicePlayUI(msgId, audio) {
    const playBtn = document.querySelector(`[data-voice-id="${msgId}"] .chat-voice-play`);
    if (playBtn) playBtn.innerHTML = '<i class="fas fa-pause"></i>';

    // Update duration display
    const durationEl = document.querySelector(`[data-voice-id="${msgId}"] .chat-voice-duration`);
    clearInterval(_voicePlayInterval);
    _voicePlayInterval = setInterval(() => {
        if (audio && !audio.paused && durationEl) {
            const current = audio.currentTime || 0;
            const m = Math.floor(current / 60);
            const s = Math.floor(current % 60);
            durationEl.textContent = `${m}:${String(s).padStart(2, '0')}`;
        }
    }, 250);
}

function stopVoicePlayUI(msgId) {
    clearInterval(_voicePlayInterval);
    if (!msgId) return;
    const playBtn = document.querySelector(`[data-voice-id="${msgId}"] .chat-voice-play`);
    if (playBtn) playBtn.innerHTML = '<i class="fas fa-play"></i>';
    const durationEl = document.querySelector(`[data-voice-id="${msgId}"] .chat-voice-duration`);
    // Will update with final duration once metadata loads
}

// Track if container-level listeners are already bound (prevent duplicates on re-render)
let _chatContainerEventsBound = false;

function bindChatMessageEvents() {
    const container = document.getElementById('chatMessages');

    // ---- Voice play button (event delegation — bind ONCE) ----
    if (!_chatContainerEventsBound) {
        _chatContainerEventsBound = true;
        container.addEventListener('click', e => {
            const playBtn = e.target.closest('[data-action="play-voice"]');
            if (playBtn) {
                e.stopPropagation();
                const voiceId = playBtn.dataset.voiceId;
                if (voiceId) playVoiceMessage(voiceId);
                return;
            }
        });
    }

    // ---- Per-message events: double-tap, long-press + swipe-to-reply ----
    container.querySelectorAll('.chat-msg').forEach(el => {
        // Skip if events already bound for this element
        if (el.dataset.eventsBound) return;
        el.dataset.eventsBound = '1';

        const msgId = el.dataset.msgId;
        let timer = null;
        let touchStartX = 0;
        let touchStartY = 0;
        let longPressFired = false;

        // ---- Double-tap state (per message) ----
        let lastTapTime = 0;
        let lastTapX = 0;
        let lastTapY = 0;
        let singleTapTimer = null;

        // ---- Swipe-to-reply state ----
        let swipeStartX = 0;
        let swipeStartY = 0;
        let swipeActive = false;
        let swipeMoved = false;
        let swipeDir = 0; // -1 = left, 1 = right

        const startPress = (e) => {
            longPressFired = false;
            // Store position for context menu positioning
            if (e.touches && e.touches.length > 0) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            } else {
                touchStartX = e.clientX;
                touchStartY = e.clientY;
            }
            timer = setTimeout(() => {
                longPressFired = true;
                selectedChatMsgId = msgId;
                showChatContextMenuAt(touchStartX, touchStartY, msgId);
            }, 500);
        };
        const endPress = () => { clearTimeout(timer); };
        const movePress = (e) => {
            // Cancel long-press if finger moves too much (allows scrolling)
            if (e.touches && e.touches.length > 0) {
                const dx = Math.abs(e.touches[0].clientX - touchStartX);
                const dy = Math.abs(e.touches[0].clientY - touchStartY);
                if (dx > 10 || dy > 10) clearTimeout(timer);
            }
        };

        // ---- Double-tap handler (Instagram-style heart) ----
        const handleDoubleTap = (x, y) => {
            // Cancel any pending single-tap
            clearTimeout(singleTapTimer);
            // Add heart reaction
            addChatReaction(msgId, 'heart');
            // Show big heart animation at tap position
            showHeartAnimation(x, y);
        };

        // Check for double-tap on touchend — ONLY double-tap reacts, single tap does nothing
        const checkDoubleTap = (x, y) => {
            const now = Date.now();
            const dx = Math.abs(x - lastTapX);
            const dy = Math.abs(y - lastTapY);
            if (now - lastTapTime < 350 && dx < 40 && dy < 40) {
                handleDoubleTap(x, y);
                lastTapTime = 0; // Reset to prevent triple-tap
                return true;
            }
            lastTapTime = now;
            lastTapX = x;
            lastTapY = y;
            // Single tap does NOTHING — no reaction, no action
            return false;
        };

        // ---- Swipe-to-reply: touch handlers (Instagram-style spring animation) ----
        const swipeTouchStart = (e) => {
            if (e.touches.length !== 1) return;
            swipeStartX = e.touches[0].clientX;
            swipeStartY = e.touches[0].clientY;
            swipeActive = false;
            swipeMoved = false;
            swipeDir = 0;
            el.style.transition = 'none';
        };

        const swipeTouchMove = (e) => {
            if (e.touches.length !== 1) return;
            const dx = e.touches[0].clientX - swipeStartX;
            const dy = e.touches[0].clientY - swipeStartY;

            // Activate swipe on ANY horizontal direction
            if (!swipeActive && Math.abs(dx) > 20 && Math.abs(dx) > Math.abs(dy) * 1.5) {
                swipeActive = true;
                swipeDir = dx > 0 ? 1 : -1;
            }

            if (swipeActive) {
                // Move bubble in swipe direction, capped at 80px with slight resistance
                const maxOffset = 80;
                const rawOffset = Math.abs(dx);
                const resistance = rawOffset > maxOffset ? maxOffset + (rawOffset - maxOffset) * 0.3 : rawOffset;
                const offset = swipeDir * Math.min(resistance, 100);
                el.style.transform = `translateX(${offset}px)`;
                // Show reply icon on the opposite side of the swipe
                if (!el.querySelector('.swipe-reply-icon')) {
                    const icon = document.createElement('div');
                    icon.className = 'swipe-reply-icon';
                    icon.innerHTML = '<i class="fas fa-reply"></i>';
                    if (swipeDir > 0) {
                        icon.classList.add('left');
                    } else {
                        icon.classList.add('right');
                    }
                    el.appendChild(icon);
                }
                swipeMoved = true;
            }
        };

        const swipeTouchEnd = (e) => {
            // Spring animation back to original position
            el.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
            el.style.transform = 'translateX(0)';

            // Remove reply icon after animation
            setTimeout(() => {
                const icon = el.querySelector('.swipe-reply-icon');
                if (icon) icon.remove();
            }, 400);

            // Trigger reply if swiped far enough
            if (swipeActive && swipeMoved) {
                const endTouch = e.changedTouches ? e.changedTouches[0] : e;
                const totalDx = Math.abs(endTouch.clientX - swipeStartX);
                if (totalDx > 60) {
                    replyToMessage(msgId);
                }
            }

            swipeActive = false;
            swipeMoved = false;
            swipeDir = 0;
        };

        // Touch events - DO NOT call preventDefault on touchstart (that blocks scrolling!)
        el.addEventListener('touchstart', (e) => { startPress(e); swipeTouchStart(e); }, { passive: true });
        el.addEventListener('touchend', (e) => {
            endPress();
            // Record touch end time to prevent synthetic mouse events
            _lastTouchEndTime = Date.now();
            // Check double-tap - ONLY double-tap adds heart reaction, single tap does NOTHING
            const touch = e.changedTouches ? e.changedTouches[0] : e;
            const wasDoubleTap = checkDoubleTap(touch.clientX, touch.clientY);
            if (wasDoubleTap) {
                clearTimeout(timer); // Cancel any pending long-press
            }
            swipeTouchEnd(e);
        });
        el.addEventListener('touchmove', (e) => { movePress(e); swipeTouchMove(e); }, { passive: true });
        // Mouse events for desktop - skip if touch just ended (prevents synthetic mouse double-tap)
        el.addEventListener('mousedown', (e) => {
            if (Date.now() - _lastTouchEndTime < 800) return; // Ignore synthetic mouse event after touch
            startPress(e);
        });
        el.addEventListener('mouseup', (e) => {
            if (Date.now() - _lastTouchEndTime < 800) return; // Ignore synthetic mouse event after touch
            endPress();
            checkDoubleTap(e.clientX, e.clientY);
            // Only double-click adds heart — single click does nothing
        });
        el.addEventListener('mouseleave', endPress);
        // Right-click context menu for desktop
        el.addEventListener('contextmenu', e => {
            e.preventDefault();
            selectedChatMsgId = msgId;
            showChatContextMenuAt(e.clientX, e.clientY, msgId);
        });
    });
}

// ---- Instagram-style Heart Animation ----
function showHeartAnimation(x, y) {
    const heart = document.getElementById('doubleTapHeart');
    if (!heart) return;
    // Position at the tap location
    heart.style.left = x + 'px';
    heart.style.top = y + 'px';
    // Reset animation
    heart.classList.remove('show');
    // Force reflow
    void heart.offsetWidth;
    heart.style.display = 'block';
    heart.classList.add('show');
    // Clean up after animation
    setTimeout(() => {
        heart.classList.remove('show');
        heart.style.display = 'none';
    }, 1000);
}

function showChatContextMenuAt(x, y, msgId) {
    const menu = document.getElementById('chatContextMenu');
    const msg = allChatMessages.find(m => m.id === msgId);
    if (!msg) return;

    menu.style.left = Math.min(x, window.innerWidth - 170) + 'px';
    menu.style.top = Math.max(60, y - 120) + 'px';
    menu.style.display = 'block';

    // Show/hide delete based on ownership
    const deleteBtn = document.getElementById('ctxDeleteBtn');
    deleteBtn.style.display = msg.author === currentUser ? 'flex' : 'none';

    // Vibrate
    if (navigator.vibrate) navigator.vibrate(30);
}

// ---- Send Chat Message ----
async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const rawText = input.value.trim();
    if (!rawText && !replyingTo) return;
    if (!rawText) return;

    // Optimistic: clear input immediately so it feels instant
    input.value = '';
    updateChatSendBtn();
    clearTypingStatus();

    try {
        const encText = isEncryptionSetup ? await encryptText(rawText) : rawText;
        const msgData = {
            author: currentUser,
            text: encText,
            encrypted: isEncryptionSetup,
            readBy: { [currentUser.toLowerCase()]: true },
            deleted: false,
            reactions: {},
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Reply
        if (replyingTo) {
            const replyMsg = allChatMessages.find(m => m.id === replyingTo);
            if (replyMsg) {
                msgData.replyTo = replyingTo;
                msgData.replyToAuthor = replyMsg.author;
                msgData.replyToText = isEncryptionSetup ? await encryptText((replyMsg.text || '').substring(0, 100)) : (replyMsg.text || '').substring(0, 100);
            }
            cancelReply();
        }

        await fdb.collection(MESSAGES_COLLECTION).add(msgData);
    } catch (e) {
        console.error('Send message failed:', e);
        showToast('Failed to send');
        // Restore input on failure
        input.value = rawText;
        updateChatSendBtn();
    }
}

// ---- Send Chat Image ----
async function sendChatImage(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('Image too large. Max 5MB.'); return; }
    try {
        const compressed = await compressImage(file);
        const encImage = isEncryptionSetup ? await encryptText(compressed) : compressed;
        const msgData = {
            author: currentUser,
            text: '',
            imageData: encImage,
            encrypted: isEncryptionSetup,
            readBy: { [currentUser.toLowerCase()]: true },
            deleted: false,
            reactions: {},
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        if (replyingTo) {
            const replyMsg = allChatMessages.find(m => m.id === replyingTo);
            if (replyMsg) {
                msgData.replyTo = replyingTo;
                msgData.replyToAuthor = replyMsg.author;
                msgData.replyToText = isEncryptionSetup ? await encryptText((replyMsg.text || '').substring(0, 100)) : (replyMsg.text || '').substring(0, 100);
            }
            cancelReply();
        }
        await fdb.collection(MESSAGES_COLLECTION).add(msgData);
        showToast('Photo sent!');
    } catch (e) { console.error('Send image failed:', e); showToast('Failed to send photo'); }
}

// ---- Voice Messages ----
function startVoiceRecording() {
    // Check if MediaRecorder is available at all
    if (typeof MediaRecorder === 'undefined') {
        showToast('Voice recording not supported on this browser');
        return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showToast('Microphone access not available');
        return;
    }
    if (isRecordingVoice) return;

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        // Pick the best supported MIME type (Safari doesn't support audio/webm)
        let mimeType = '';
        const tryTypes = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/ogg;codecs=opus',
            'audio/mp4',
            'audio/mpeg'
        ];
        for (const type of tryTypes) {
            if (MediaRecorder.isTypeSupported(type)) {
                mimeType = type;
                break;
            }
        }

        const options = mimeType ? { mimeType } : {};
        try {
            mediaRecorder = new MediaRecorder(stream, options);
        } catch (e) {
            console.error('MediaRecorder creation failed:', e);
            stream.getTracks().forEach(t => t.stop());
            showToast('Voice recording not supported');
            return;
        }
        const actualMime = mediaRecorder.mimeType || 'audio/webm';
        voiceChunks = [];
        mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) voiceChunks.push(e.data); };
        mediaRecorder.onerror = (e) => {
            console.error('MediaRecorder error:', e);
            stopVoiceRecording(false);
            showToast('Recording error occurred');
        };
        mediaRecorder.onstop = async () => {
            try { stream.getTracks().forEach(t => t.stop()); } catch(e) {}
            if (voiceChunks.length === 0) {
                showToast('No voice data recorded');
                return;
            }
            const blob = new Blob(voiceChunks, { type: actualMime });
            // Check size limit (Firestore doc max ~1MB, keep voice under 500KB raw)
            if (blob.size > 500000) {
                showToast('Voice message too long. Try under 60 seconds.');
                return;
            }
            // Convert to base64 safely using chunked approach
            try {
                const base64 = await blobToBase64(blob);
                const encVoice = isEncryptionSetup ? await encryptText(base64) : base64;
                const msgData = {
                    author: currentUser, text: '', voiceData: encVoice,
                    voiceMime: actualMime,
                    encrypted: isEncryptionSetup,
                    readBy: { [currentUser.toLowerCase()]: true },
                    deleted: false, reactions: {},
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                };
                if (replyingTo) {
                    msgData.replyTo = replyingTo;
                    const replyMsg = allChatMessages.find(m => m.id === replyingTo);
                    if (replyMsg) {
                        msgData.replyToAuthor = replyMsg.author || '?';
                        msgData.replyToText = replyMsg.text || (replyMsg.imageData ? '📷 Photo' : (replyMsg.voiceData ? '🎙️ Voice' : ''));
                    }
                    cancelReply();
                }
                await fdb.collection(MESSAGES_COLLECTION).add(msgData);
                showToast('Voice message sent!');
            } catch (e) { console.error('Voice send failed:', e); showToast('Failed to send voice message'); }
        };
        // Request data every 3 seconds for better chunk handling
        try {
            mediaRecorder.start(3000);
        } catch (e) {
            console.error('MediaRecorder start failed:', e);
            stream.getTracks().forEach(t => t.stop());
            showToast('Could not start recording');
            return;
        }
        isRecordingVoice = true;
        voiceRecordingSeconds = 0;
        document.getElementById('chatVoiceOverlay').style.display = 'flex';
        document.getElementById('chatInputBar').style.display = 'none';
        // Populate recording waveform bars
        const waveformEl = document.getElementById('voiceRecWaveform');
        if (waveformEl) {
            waveformEl.innerHTML = Array.from({length: 30}, (_, i) =>
                `<div class="voice-rec-waveform-bar" style="animation-delay:${i * 0.08}s"></div>`
            ).join('');
        }
        voiceRecordingTimer = setInterval(() => {
            voiceRecordingSeconds++;
            const m = Math.floor(voiceRecordingSeconds / 60);
            const s = voiceRecordingSeconds % 60;
            document.getElementById('voiceRecTime').textContent = `${m}:${String(s).padStart(2, '0')}`;
            // Auto-stop at 60 seconds
            if (voiceRecordingSeconds >= 60) {
                stopVoiceRecording(true);
            }
        }, 1000);
    }).catch(e => {
        console.error('Mic access denied:', e);
        if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
            showToast('Microphone permission denied. Please allow mic access.');
        } else if (e.name === 'NotFoundError') {
            showToast('No microphone found on this device');
        } else {
            showToast('Could not access microphone');
        }
    });
}

// Safe blob to base64 conversion (avoids FileReader issues on some mobile browsers)
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('FileReader failed'));
        reader.readAsDataURL(blob);
    });
}

function stopVoiceRecording(send) {
    if (!isRecordingVoice) return;
    clearInterval(voiceRecordingTimer);
    isRecordingVoice = false;
    document.getElementById('chatVoiceOverlay').style.display = 'none';
    document.getElementById('chatInputBar').style.display = 'flex';
    if (send && mediaRecorder) {
        try {
            if (mediaRecorder.state === 'recording') {
                mediaRecorder.stop(); // This triggers onstop which sends the message
            }
        } catch(e) { console.error('Stop recorder failed:', e); mediaRecorder = null; }
    } else {
        // Cancel recording
        try {
            if (mediaRecorder && mediaRecorder.state === 'recording') mediaRecorder.stop();
        } catch(e) {}
        try {
            if (mediaRecorder && mediaRecorder.stream) mediaRecorder.stream.getTracks().forEach(t => t.stop());
        } catch(e) {}
        mediaRecorder = null;
        voiceChunks = [];
    }
}

// ---- Chat Themes ----
function openChatThemeModal() {
    const modal = document.getElementById('chatThemeModal');
    const grid = document.getElementById('chatThemeGrid');
    grid.innerHTML = '';
    Object.entries(CHAT_THEMES).forEach(([key, theme]) => {
        const btn = document.createElement('button');
        btn.className = 'chat-theme-option' + (currentChatTheme === key ? ' active' : '');
        btn.innerHTML = `
            <div class="chat-theme-preview" style="background:${theme.bg}">
                <div class="preview-sent" style="background:${theme.sentGrad || theme.sent}"></div>
                <div class="preview-received" style="background:${theme.received}"></div>
            </div>
            <span class="chat-theme-label">${theme.label}</span>
        `;
        btn.addEventListener('click', () => {
            applyChatTheme(key);
            currentChatTheme = key;
            localStorage.setItem('lovelore_chat_theme', key);
            // Save to Firestore so partner sees it too
            if (fdb) {
                fdb.collection(CHAT_META_COLLECTION).doc('theme').set({ current: key, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }).catch(e => console.error('Theme save failed:', e));
            }
            // Update active state
            grid.querySelectorAll('.chat-theme-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            showToast('Theme applied!');
        });
        grid.appendChild(btn);
    });
    modal.style.display = 'flex';
}

function applyChatTheme(themeKey) {
    const theme = CHAT_THEMES[themeKey];
    if (!theme) return;
    const root = document.documentElement;
    // Set CSS custom properties for the chat theme
    root.style.setProperty('--chat-bg', theme.bg);
    root.style.setProperty('--chat-sent-grad', theme.sentGrad || theme.sent);
    root.style.setProperty('--chat-sent', theme.sent);
    root.style.setProperty('--chat-received', theme.received);
    // Handle dark themes
    if (themeKey === 'midnight') {
        root.style.setProperty('--chat-text-received', '#E0E0E0');
        root.style.setProperty('--chat-time-sent', 'rgba(255,255,255,0.6)');
        root.style.setProperty('--chat-time-received', 'rgba(255,255,255,0.4)');
        root.style.setProperty('--chat-header-bg', '#1A1A2E');
        root.style.setProperty('--chat-header-border', '#2A2A4A');
        root.style.setProperty('--chat-input-bg', '#1A1A2E');
        root.style.setProperty('--chat-input-wrapper-bg', '#2A2A4A');
        root.style.setProperty('--chat-header-text', '#E0E0E0');
        root.style.setProperty('--chat-input-text', '#E0E0E0');
        root.style.setProperty('--chat-date-pill', '#2A2A4A');
        root.style.setProperty('--chat-date-text', 'rgba(255,255,255,0.5)');
    } else {
        root.style.setProperty('--chat-text-received', '');
        root.style.setProperty('--chat-time-sent', '');
        root.style.setProperty('--chat-time-received', '');
        root.style.setProperty('--chat-header-bg', '');
        root.style.setProperty('--chat-header-border', '');
        root.style.setProperty('--chat-input-bg', '');
        root.style.setProperty('--chat-input-wrapper-bg', '');
        root.style.setProperty('--chat-header-text', '');
        root.style.setProperty('--chat-input-text', '');
        root.style.setProperty('--chat-date-pill', '');
        root.style.setProperty('--chat-date-text', '');
    }
    // Set the data attribute on body for CSS selectors
    document.body.setAttribute('data-chat-theme', themeKey === 'default' ? '' : themeKey);
    currentChatTheme = themeKey;
}

function loadChatTheme() {
    // Load from localStorage first for instant apply
    const savedTheme = localStorage.getItem('lovelore_chat_theme');
    if (savedTheme) {
        applyChatTheme(savedTheme);
    }
    // Then listen for Firestore changes (partner changes)
    if (fdb) {
        fdb.collection(CHAT_META_COLLECTION).doc('theme').onSnapshot(doc => {
            if (doc.exists) {
                const theme = doc.data().current;
                if (theme && theme !== currentChatTheme) {
                    applyChatTheme(theme);
                    localStorage.setItem('lovelore_chat_theme', theme);
                }
            }
        });
    }
}

// ---- Typing Indicator ----
function setTypingStatus(isTyping) {
    if (!fdb || !currentUser) return;
    const key = 'typing' + currentUser;
    const updateKey = 'typingUpdatedAt' + currentUser;
    fdb.collection(CHAT_META_COLLECTION).doc('status').set({
        [key]: isTyping,
        [updateKey]: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true }).catch(e => console.error('Typing status failed:', e));
}

function clearTypingStatus() {
    setTypingStatus(false);
    clearTimeout(typingTimeout);
}

function handleChatTyping() {
    setTypingStatus(true);
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => setTypingStatus(false), 3000);
}

// ---- Online Status ----
// Uses a heartbeat system: each online user writes a timestamp every 30s.
// If the timestamp is older than 90s, they are considered offline.
let heartbeatInterval = null;

function updateOnlineStatus(isOnline) {
    if (!fdb || !currentUser) return;
    const key = currentUser.toLowerCase();
    fdb.collection(CHAT_META_COLLECTION).doc('status').set({
        [key]: { isOnline, lastSeen: firebase.firestore.FieldValue.serverTimestamp() }
    }, { merge: true }).catch(e => console.error('Online status failed:', e));

    // Start/stop heartbeat
    if (isOnline) {
        startHeartbeat();
    } else {
        stopHeartbeat();
    }
}

function startHeartbeat() {
    if (heartbeatInterval) return; // Already running
    heartbeatInterval = setInterval(() => {
        if (!fdb || !currentUser) { stopHeartbeat(); return; }
        const key = currentUser.toLowerCase();
        fdb.collection(CHAT_META_COLLECTION).doc('status').set({
            [key]: { isOnline: true, lastSeen: firebase.firestore.FieldValue.serverTimestamp() }
        }, { merge: true }).catch(e => console.error('Heartbeat failed:', e));
    }, 30000); // Every 30 seconds
}

function stopHeartbeat() {
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
    }
}

// ---- Read Receipts ----
async function markMessagesAsRead() {
    if (!fdb || !currentUser) return;
    try {
        const snapshot = await fdb.collection(MESSAGES_COLLECTION)
            .where('author', '!=', currentUser)
            .where('deleted', '==', false)
            .limit(50).get();

        const batch = fdb.batch();
        let count = 0;
        snapshot.forEach(doc => {
            const data = doc.data();
            const readBy = data.readBy || {};
            if (!readBy[currentUser.toLowerCase()]) {
                batch.update(doc.ref, { [`readBy.${currentUser.toLowerCase()}`]: true });
                count++;
            }
        });
        if (count > 0) await batch.commit();
    } catch (e) { console.error('Mark read failed:', e); }
}

// ---- Chat Reactions ----
async function addChatReaction(msgId, reactionType) {
    try {
        const userKey = currentUser.toLowerCase();
        const docRef = fdb.collection(MESSAGES_COLLECTION).doc(msgId);
        const doc = await docRef.get();
        if (!doc.exists) { console.error('Message not found for reaction'); return; }
        const currentReactions = doc.data().reactions || {};
        // Toggle: if same reaction exists, remove it; otherwise set it
        if (currentReactions[userKey] === reactionType) {
            delete currentReactions[userKey];
        } else {
            currentReactions[userKey] = reactionType;
        }
        await docRef.update({ reactions: currentReactions });
    } catch (e) { console.error('Chat reaction failed:', e); showToast('Reaction failed'); }
}

// ---- Reply (Instagram-style) ----
function replyToMessage(msgId) {
    const msg = allChatMessages.find(m => m.id === msgId);
    if (!msg) return;
    replyingTo = msgId;
    const preview = document.getElementById('chatReplyPreview');
    document.getElementById('chatReplyAuthor').textContent = msg.author || '?';
    document.getElementById('chatReplyText').textContent = (msg.text || (msg.imageData ? '📷 Photo' : (msg.voiceData ? '🎙️ Voice message' : ''))).substring(0, 60);
    preview.style.display = 'flex';
    document.getElementById('chatInput').focus();
    // Close context menu
    document.getElementById('chatContextMenu').style.display = 'none';
}

function cancelReply() {
    replyingTo = null;
    document.getElementById('chatReplyPreview').style.display = 'none';
}

// ---- Delete Message ----
async function deleteChatMessage(msgId) {
    try {
        await fdb.collection(MESSAGES_COLLECTION).doc(msgId).update({ deleted: true, text: '', imageData: '', voiceData: '' });
        showToast('Message deleted');
    } catch (e) { console.error('Delete message failed:', e); showToast('Failed to delete'); }
    document.getElementById('chatContextMenu').style.display = 'none';
}

// ---- Chat Search ----
function openChatSearch() {
    document.getElementById('chatSearchOverlay').style.display = 'flex';
    document.getElementById('chatSearchInput').value = '';
    document.getElementById('chatSearchInput').focus();
    document.getElementById('chatSearchResults').innerHTML = '';
}

function closeChatSearch() {
    document.getElementById('chatSearchOverlay').style.display = 'none';
}

function searchChatMessages(query) {
    const results = allChatMessages.filter(m => !m.deleted && m.text && m.text.toLowerCase().includes(query.toLowerCase()));
    const container = document.getElementById('chatSearchResults');
    if (results.length === 0) {
        container.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-light)">No results found</div>';
        return;
    }
    container.innerHTML = results.slice(0, 20).map(m => {
        const time = formatChatTime(m.createdAt);
        return `<div class="chat-search-result" onclick="scrollToMessage('${m.id}')">
            <div class="chat-search-result-author">${m.author || '?'}</div>
            <div class="chat-search-result-text">${escapeHtml((m.text || '').substring(0, 80))}</div>
            <div class="chat-search-result-time">${time}</div></div>`;
    }).join('');
}

function scrollToMessage(msgId) {
    closeChatSearch();
    const el = document.querySelector(`.chat-msg[data-msg-id="${msgId}"]`);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.background = 'var(--primary-light)';
        setTimeout(() => { el.style.background = ''; }, 2000);
    }
}

// ---- Chat Helpers ----
function formatChatTime(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    // Instagram-style: just show time, no date
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function updateChatSendBtn() {
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('chatSendBtn');
    const voiceBtn = document.getElementById('chatVoiceBtn');
    if (!input || !sendBtn) return;
    const hasText = input.value.trim().length > 0;
    // Instagram-style: send button morphs from mic when typing
    if (hasText) {
        sendBtn.classList.add('visible');
        sendBtn.disabled = false;
        if (voiceBtn) voiceBtn.classList.add('hidden');
    } else {
        sendBtn.classList.remove('visible');
        sendBtn.disabled = true;
        if (voiceBtn) voiceBtn.classList.remove('hidden');
    }
}

function scrollChatToBottom() {
    const container = document.getElementById('chatMessages');
    if (container) container.scrollTop = container.scrollHeight;
    const btn = document.getElementById('chatNewMsgBtn');
    if (btn) btn.style.display = 'none';
}

// ============ LOVE LETTERS ============

function attachLettersListener() {
    if (lettersUnsubscribe) lettersUnsubscribe();
    lettersUnsubscribe = fdb.collection(LETTERS_COLLECTION)
        .orderBy('createdAt', 'desc')
        .onSnapshot(async snapshot => {
            const letters = [];
            for (const doc of snapshot.docs) {
                const data = doc.data();
                if (isEncryptionSetup) {
                    data.text = await decryptField(data.text, doc.id, 'text');
                    if (data.imageData) data.imageData = await decryptField(data.imageData, doc.id, 'imageData');
                }
                letters.push({ id: doc.id, ...data });
            }
            renderLetters(letters);
        }, error => console.error('Letters listener error:', error));
}

function renderLetters(letters) {
    const list = document.getElementById('lettersList');
    const emptyEl = document.getElementById('lettersEmpty');
    if (!letters || letters.length === 0) {
        list.innerHTML = ''; emptyEl.style.display = 'block'; return;
    }
    emptyEl.style.display = 'none';
    list.innerHTML = letters.map(l => {
        const dateStr = l.createdAt ? (l.createdAt.toDate ? l.createdAt.toDate() : new Date(l.createdAt)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
        if (l.openedBy) {
            return `<div class="letter-card letter-card-opened" onclick="viewLetter('${l.id}')">
                <div class="letter-card-top">
                    <div class="letter-open-icon">💌</div>
                    <div class="letter-card-info">
                        <div class="letter-card-label">Opened Letter</div>
                        <div class="letter-card-date">${dateStr}</div>
                        <div class="letter-card-author">From ${l.author || '?'}</div>
                    </div>
                    <div class="letter-card-badge"><i class="fas fa-envelope-open"></i></div>
                </div></div>`;
        } else {
            const isForMe = l.author !== currentUser;
            return `<div class="letter-card letter-card-sealed" ${isForMe ? `onclick="openLetter('${l.id}')"` : ''}>
                <div class="letter-card-top">
                    <div class="letter-seal-icon"><i class="fas fa-envelope"></i></div>
                    <div class="letter-card-info">
                        <div class="letter-card-label">${isForMe ? 'New Letter!' : 'Sealed Letter'}</div>
                        <div class="letter-card-date">${dateStr}</div>
                        <div class="letter-card-author">From ${l.author || '?'}</div>
                    </div>
                    <div class="letter-card-badge">${isForMe ? '✨' : '<i class="fas fa-lock"></i>'}</div>
                </div></div>`;
        }
    }).join('');
}

function openLetterCreateModal() {
    document.getElementById('letterCreateModal').style.display = 'flex';
    document.getElementById('letterText').value = '';
    letterImageData = null;
    document.getElementById('letterImagePreview').style.display = 'none';
    document.getElementById('letterImageInput').value = '';
}

function closeLetterCreateModal() { document.getElementById('letterCreateModal').style.display = 'none'; letterImageData = null; }

async function handleLetterImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('Image too large'); return; }
    try {
        const compressed = await compressImage(file);
        letterImageData = compressed;
        document.getElementById('letterPreviewImg').src = compressed;
        document.getElementById('letterImagePreview').style.display = 'block';
    } catch (err) { showToast('Failed to process image'); }
}

function removeLetterImage() {
    letterImageData = null;
    document.getElementById('letterImagePreview').style.display = 'none';
    document.getElementById('letterImageInput').value = '';
}

async function createLetter() {
    const rawText = document.getElementById('letterText').value.trim();
    if (!rawText && !letterImageData) { showToast('Write something first'); return; }
    try {
        const encText = (isEncryptionSetup && rawText) ? await encryptText(rawText) : (rawText || '');
        const encImage = (isEncryptionSetup && letterImageData) ? await encryptText(letterImageData) : (letterImageData || null);
        await fdb.collection(LETTERS_COLLECTION).add({
            author: currentUser, text: encText, imageData: encImage,
            encrypted: isEncryptionSetup, openedBy: null,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        closeLetterCreateModal();
        showToast('Love letter sent! 💌');
    } catch (e) { console.error('Create letter failed:', e); showToast('Failed to send letter'); }
}

async function openLetter(letterId) {
    try {
        await fdb.collection(LETTERS_COLLECTION).doc(letterId).update({
            openedBy: currentUser,
            openedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        viewLetter(letterId);
    } catch (e) { console.error('Open letter failed:', e); showToast('Failed to open letter'); }
}

async function viewLetter(letterId) {
    try {
        const doc = await fdb.collection(LETTERS_COLLECTION).doc(letterId).get();
        if (!doc.exists) return;
        const data = doc.data();
        if (isEncryptionSetup) {
            data.text = await decryptField(data.text, doc.id, 'text');
            if (data.imageData) data.imageData = await decryptField(data.imageData, doc.id, 'imageData');
        }
        let imgHtml = data.imageData ? `<img class="letter-view-img" src="${data.imageData}" alt="" onclick="openImageViewer('${data.imageData.replace(/'/g, "\\'")}')">` : '';
        document.getElementById('letterViewContent').innerHTML = `
            <div class="letter-view-meta">
                <div class="letter-view-author">From ${data.author || '?'}</div>
            </div>
            ${imgHtml}
            <div class="letter-view-text">${escapeHtml(data.text || '')}</div>`;
        document.getElementById('letterViewModal').style.display = 'flex';
    } catch (e) { console.error('View letter failed:', e); }
}

function closeLetterViewModal() { document.getElementById('letterViewModal').style.display = 'none'; }

// Online status on tab close/hide — multiple fallbacks for mobile reliability
window.addEventListener('beforeunload', () => {
    updateOnlineStatus(false);
});
document.addEventListener('visibilitychange', () => {
    if (currentUser) updateOnlineStatus(!document.hidden);
});
// Also handle pagehide (more reliable on mobile than beforeunload)
window.addEventListener('pagehide', () => {
    updateOnlineStatus(false);
});
// Freeze/resume events for mobile PWA
document.addEventListener('freeze', () => {
    updateOnlineStatus(false);
});
document.addEventListener('resume', () => {
    if (currentUser) updateOnlineStatus(true);
});

// ============ SERVICE WORKER REGISTRATION ============

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then(reg => {
            console.log('SW registered');
            // Check for updates every 30 minutes
            setInterval(() => reg.update(), 30 * 60 * 1000);
        }).catch(e => {
            console.warn('SW registration failed:', e);
        });
    });
}
