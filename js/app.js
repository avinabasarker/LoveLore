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

// ---- App State ----
let currentUser = null;       // 'A' or 'P'
let fdb = null;               // Firestore instance
let fAuth = null;             // Firebase Auth instance
let postsUnsubscribe = null;  // Real-time listener for posts
let commentsUnsubscribe = null; // Real-time listener for comments
let currentPostForComments = null; // Post ID for open comments modal
let pendingImageData = null;  // Base64 image waiting to be posted
let selectedUser = null;      // Temp: user selected on login screen
let lastTapTime = 0;          // Double-tap detection
let lastTapPostId = null;     // Double-tap target
let allPostsCache = [];       // Cache of all posts for gallery

// ---- Constants ----
const USERS = ['A', 'P'];
const SESSION_KEY = 'lovelore_session';
const ACCOUNTS_COLLECTION = 'social_accounts';
const POSTS_COLLECTION = 'social_posts';
const COMMENTS_COLLECTION = 'social_comments';
const SETTINGS_COLLECTION = 'social_settings';
const IMAGE_MAX_WIDTH = 800;
const IMAGE_QUALITY = 0.6;

// ============ INITIALIZATION ============

document.addEventListener('DOMContentLoaded', () => {
    initFirebase();
    checkSession();
    setupEventListeners();
});

function initFirebase() {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(FIREBASE_CONFIG);
        }
        fdb = firebase.firestore();
        fAuth = firebase.auth();

        // Enable offline persistence
        fdb.enablePersistence({ synchronizeTabs: true }).catch(err => {
            if (err.code === 'failed-precondition') {
                console.warn('Firestore: multiple tabs open');
            } else if (err.code === 'unimplemented') {
                console.warn('Firestore: persistence not supported');
            }
        });

        // Anonymous sign-in for Firestore access
        fAuth.signInAnonymously().catch(e => console.error('Auth failed:', e));

        console.log('Firebase initialized');
    } catch (e) {
        console.error('Firebase init failed:', e);
    }
}

function checkSession() {
    try {
        const session = localStorage.getItem(SESSION_KEY);
        if (session) {
            const data = JSON.parse(session);
            if (data.username && USERS.includes(data.username)) {
                currentUser = data.username;
                showMainApp();
                return;
            }
        }
    } catch (e) {
        localStorage.removeItem(SESSION_KEY);
    }
    // Show login screen (default)
}

// ============ EVENT LISTENERS ============

function setupEventListeners() {
    // Avatar selection
    document.querySelectorAll('.avatar-btn').forEach(btn => {
        btn.addEventListener('click', () => handleAvatarSelect(btn.dataset.user));
    });

    // Set password
    document.getElementById('setPasswordBtn').addEventListener('click', handleSetPassword);
    document.getElementById('confirmPassword').addEventListener('keydown', e => {
        if (e.key === 'Enter') handleSetPassword();
    });

    // Login
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    document.getElementById('loginPassword').addEventListener('keydown', e => {
        if (e.key === 'Enter') handleLogin();
    });

    // Back button
    document.getElementById('backToAvatar').addEventListener('click', () => {
        document.getElementById('passwordSection').style.display = 'none';
        document.getElementById('avatarSection').style.display = 'block';
        clearAuthErrors();
    });

    // FAB
    document.getElementById('fabCreate').addEventListener('click', openCreatePostModal);

    // Create post modal
    document.getElementById('closeCreatePost').addEventListener('click', closeCreatePostModal);
    document.getElementById('postBtn').addEventListener('click', createPost);
    document.getElementById('postText').addEventListener('input', updatePostBtnState);
    document.getElementById('imageInput').addEventListener('change', handleImageSelect);
    document.getElementById('removeImage').addEventListener('click', removeSelectedImage);

    // Comments modal
    document.getElementById('closeComments').addEventListener('click', closeCommentsModal);
    document.getElementById('sendComment').addEventListener('click', addComment);
    document.getElementById('commentInput').addEventListener('keydown', e => {
        if (e.key === 'Enter') addComment();
    });
    document.getElementById('commentInput').addEventListener('input', updateSendBtnState);

    // Image viewer
    document.getElementById('closeViewer').addEventListener('click', closeImageViewer);

    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => switchScreen(btn.dataset.screen));
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Modal overlay click to close
    document.getElementById('createPostModal').addEventListener('click', e => {
        if (e.target === e.currentTarget) closeCreatePostModal();
    });
    document.getElementById('commentsModal').addEventListener('click', e => {
        if (e.target === e.currentTarget) closeCommentsModal();
    });

    // Online/offline
    window.addEventListener('online', () => updateSyncDot('synced'));
    window.addEventListener('offline', () => updateSyncDot('offline'));
}

// ============ AUTH SYSTEM ============

async function handleAvatarSelect(user) {
    selectedUser = user;
    const lower = user.toLowerCase();

    // Visual feedback
    document.querySelectorAll('.avatar-btn').forEach(b => b.classList.remove('selected'));
    document.querySelector(`.avatar-btn[data-user="${user}"]`).classList.add('selected');

    try {
        updateSyncDot('syncing');
        // Check if account exists in Firestore
        const doc = await fdb.collection(ACCOUNTS_COLLECTION).doc(lower).get();

        // Set avatar styles
        const avatarClass = `user-${lower}`;
        document.getElementById('setPassAvatar').className = `mini-avatar ${avatarClass}`;
        document.getElementById('setPassAvatar').textContent = user;
        document.getElementById('loginAvatar').className = `mini-avatar ${avatarClass}`;
        document.getElementById('loginAvatar').textContent = user;
        document.getElementById('loginUserName').textContent = user;

        if (doc.exists && doc.data().passwordHash) {
            // Returning user — show login form
            document.getElementById('setPasswordForm').style.display = 'none';
            document.getElementById('loginForm').style.display = 'block';
        } else {
            // First time — show set password form
            document.getElementById('setPasswordForm').style.display = 'block';
            document.getElementById('loginForm').style.display = 'none';
        }

        // Show password section, hide avatar section
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

    if (!pass || pass.length < 1) {
        showAuthError('setPassError', 'Please enter a password');
        return;
    }
    if (pass !== confirm) {
        showAuthError('setPassError', 'Passwords don\'t match');
        return;
    }

    try {
        updateSyncDot('syncing');
        const hash = await hashPassword(pass);
        await fdb.collection(ACCOUNTS_COLLECTION).doc(selectedUser.toLowerCase()).set({
            username: selectedUser,
            passwordHash: hash,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        currentUser = selectedUser;
        saveSession(currentUser);
        showMainApp();
        showToast('Welcome to LoveLore! 💕');
        updateSyncDot('synced');
    } catch (e) {
        console.error('Set password failed:', e);
        showAuthError('setPassError', 'Something went wrong. Try again.');
        updateSyncDot('error');
    }
}

async function handleLogin() {
    const pass = document.getElementById('loginPassword').value;

    if (!pass) {
        showAuthError('loginError', 'Please enter your password');
        return;
    }

    try {
        updateSyncDot('syncing');
        const doc = await fdb.collection(ACCOUNTS_COLLECTION).doc(selectedUser.toLowerCase()).get();

        if (!doc.exists || !doc.data().passwordHash) {
            showAuthError('loginError', 'Account not found');
            updateSyncDot('error');
            return;
        }

        const hash = await hashPassword(pass);
        if (hash === doc.data().passwordHash) {
            currentUser = selectedUser;
            saveSession(currentUser);
            showMainApp();
            showToast('Welcome back! 💕');
            updateSyncDot('synced');
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
    const encoder = new TextEncoder();
    const data = encoder.encode(password + '_lovelore_salt_2024');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function saveSession(username) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ username, ts: Date.now() }));
}

function handleLogout() {
    if (postsUnsubscribe) postsUnsubscribe();
    if (commentsUnsubscribe) commentsUnsubscribe();
    postsUnsubscribe = null;
    commentsUnsubscribe = null;
    currentUser = null;
    selectedUser = null;
    allPostsCache = [];
    localStorage.removeItem(SESSION_KEY);

    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('avatarSection').style.display = 'block';
    document.getElementById('passwordSection').style.display = 'none';
    document.querySelectorAll('.avatar-btn').forEach(b => b.classList.remove('selected'));
    clearAuthFields();
    clearAuthErrors();
}

function showAuthError(elementId, message) {
    const el = document.getElementById(elementId);
    el.textContent = message;
    el.style.display = 'block';
}

function clearAuthErrors() {
    document.getElementById('setPassError').style.display = 'none';
    document.getElementById('loginError').style.display = 'none';
}

function clearAuthFields() {
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    document.getElementById('loginPassword').value = '';
}

// ============ MAIN APP ============

function showMainApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';

    // Set user-specific styles
    const lower = currentUser.toLowerCase();
    const avatarClass = `user-${lower}`;
    document.getElementById('createPostAvatar').className = `mini-avatar ${avatarClass}`;
    document.getElementById('createPostAvatar').textContent = currentUser;
    document.getElementById('createPostUser').textContent = currentUser;
    document.getElementById('commentAvatar').className = `mini-avatar tiny ${avatarClass}`;
    document.getElementById('commentAvatar').textContent = currentUser;

    // Start real-time listeners
    attachPostsListener();
    loadAnniversary();
    renderProfile();
}

// ============ REAL-TIME POSTS ============

function attachPostsListener() {
    if (postsUnsubscribe) postsUnsubscribe();

    updateSyncDot('syncing');
    document.getElementById('feedLoader').style.display = 'flex';

    postsUnsubscribe = fdb.collection(POSTS_COLLECTION)
        .orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
            const posts = [];
            snapshot.forEach(doc => {
                posts.push({ id: doc.id, ...doc.data() });
            });
            allPostsCache = posts;
            renderFeed(posts);
            renderGallery(posts);
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

    if (!posts || posts.length === 0) {
        container.innerHTML = '';
        emptyState.classList.add('show');
        return;
    }

    emptyState.classList.remove('show');
    container.innerHTML = posts.map(post => renderPostCard(post)).join('');

    // Attach event listeners to post actions
    container.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', () => toggleLike(btn.dataset.postId, btn.dataset.postAuthor));
    });

    container.querySelectorAll('.comment-btn').forEach(btn => {
        btn.addEventListener('click', () => openCommentsModal(btn.dataset.postId));
    });

    container.querySelectorAll('.post-image-wrapper').forEach(wrapper => {
        wrapper.addEventListener('click', (e) => {
            // Double-tap detection for like
            const postId = wrapper.dataset.postId;
            const postAuthor = wrapper.dataset.postAuthor;
            const now = Date.now();

            if (lastTapPostId === postId && (now - lastTapTime) < 300) {
                // Double tap! Like the post
                handleDoubleTapLike(postId, postAuthor);
                lastTapTime = 0;
                lastTapPostId = null;
            } else {
                // Single tap — open image viewer after short delay
                lastTapTime = now;
                lastTapPostId = postId;

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
    const isLiked = post.likes && post.likes[currentUser.toLowerCase()];
    const likeCount = post.likes ? Object.keys(post.likes).length : 0;
    const commentCount = post.commentCount || 0;
    const timeStr = timeAgo(post.createdAt);

    let imageHtml = '';
    if (post.imageData) {
        imageHtml = `
            <div class="post-image-wrapper" data-post-id="${post.id}" data-post-author="${post.author}">
                <img src="${post.imageData}" alt="Post image" loading="lazy">
            </div>`;
    }

    let likeText = '';
    if (likeCount === 1) {
        likeText = '1 like';
    } else if (likeCount > 1) {
        likeText = likeCount + ' likes';
    }

    let commentPreview = '';
    if (commentCount > 0) {
        commentPreview = `
            <div class="post-comment-preview" data-post-id="${post.id}">
                View ${commentCount === 1 ? 'comment' : 'all ' + commentCount + ' comments'}
            </div>`;
    }

    let textHtml = '';
    if (post.text) {
        textHtml = `<div class="post-text-content">${escapeHtml(post.text)}</div>`;
    }

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
                <button class="post-action-btn like-btn ${isLiked ? 'liked' : ''}" data-post-id="${post.id}" data-post-author="${post.author}">
                    <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i>
                </button>
                <button class="post-action-btn comment-btn" data-post-id="${post.id}">
                    <i class="far fa-comment"></i>
                </button>
            </div>
            ${likeText ? `<div class="post-likes-text">${likeText}</div>` : ''}
            ${commentPreview}
        </div>`;
}

// ============ LIKES ============

async function toggleLike(postId, postAuthor) {
    try {
        const postRef = fdb.collection(POSTS_COLLECTION).doc(postId);
        const doc = await postRef.get();
        if (!doc.exists) return;

        const likes = doc.data().likes || {};
        const userKey = currentUser.toLowerCase();

        if (likes[userKey]) {
            // Unlike
            await postRef.update({
                [`likes.${userKey}`]: firebase.firestore.FieldValue.delete()
            });
        } else {
            // Like
            await postRef.update({
                [`likes.${userKey}`]: true
            });
        }
    } catch (e) {
        console.error('Toggle like failed:', e);
    }
}

function handleDoubleTapLike(postId, postAuthor) {
    // Show heart animation
    const heart = document.getElementById('doubleTapHeart');
    heart.classList.remove('show');
    void heart.offsetWidth; // Force reflow
    heart.style.display = 'block';
    heart.classList.add('show');

    setTimeout(() => {
        heart.style.display = 'none';
        heart.classList.remove('show');
    }, 800);

    // Like the post (if not already liked)
    const postCard = document.querySelector(`.post-card[data-post-id="${postId}"]`);
    if (postCard) {
        const likeBtn = postCard.querySelector('.like-btn');
        if (likeBtn && !likeBtn.classList.contains('liked')) {
            toggleLike(postId, postAuthor);
        }
    }
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
    if (commentsUnsubscribe) {
        commentsUnsubscribe();
        commentsUnsubscribe = null;
    }
    currentPostForComments = null;
}

function loadComments(postId) {
    if (commentsUnsubscribe) commentsUnsubscribe();

    // NOTE: We do NOT use .orderBy() here because that would require
    // a Firestore composite index on (postId, createdAt) which needs
    // manual setup in Firebase Console. Instead, we sort client-side.
    commentsUnsubscribe = fdb.collection(COMMENTS_COLLECTION)
        .where('postId', '==', postId)
        .onSnapshot(snapshot => {
            const comments = [];
            snapshot.forEach(doc => {
                comments.push({ id: doc.id, ...doc.data() });
            });
            // Sort client-side by createdAt ascending
            comments.sort((a, b) => {
                const timeA = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime()) : 0;
                const timeB = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime()) : 0;
                return timeA - timeB;
            });
            renderComments(comments);
        }, error => {
            console.error('Comments listener error:', error);
        });
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
        return `
            <div class="comment-item">
                <div class="comment-avatar ${avatarClass}">${c.author || '?'}</div>
                <div class="comment-body">
                    <span class="comment-author">${escapeHtml(c.author || 'Unknown')}</span>
                    <div class="comment-text">${escapeHtml(c.text || '')}</div>
                    <div class="comment-time">${timeAgo(c.createdAt)}</div>
                </div>
            </div>`;
    }).join('');

    // Scroll to bottom
    list.scrollTop = list.scrollHeight;
}

async function addComment() {
    const input = document.getElementById('commentInput');
    const text = input.value.trim();
    if (!text || !currentPostForComments) return;

    try {
        input.value = '';
        updateSendBtnState();

        await fdb.collection(COMMENTS_COLLECTION).add({
            postId: currentPostForComments,
            author: currentUser,
            text: text,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Increment comment count on the post
        await fdb.collection(POSTS_COLLECTION).doc(currentPostForComments).update({
            commentCount: firebase.firestore.FieldValue.increment(1)
        });
    } catch (e) {
        console.error('Add comment failed:', e);
        showToast('Failed to post comment');
        input.value = text; // Restore
    }
}

function updateSendBtnState() {
    const input = document.getElementById('commentInput');
    const btn = document.getElementById('sendComment');
    btn.disabled = !input.value.trim();
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

    // Check file size (max 5MB before compression)
    if (file.size > 5 * 1024 * 1024) {
        showToast('Image too large. Max 5MB.');
        return;
    }

    try {
        const compressed = await compressImage(file);
        pendingImageData = compressed;
        document.getElementById('previewImg').src = compressed;
        document.getElementById('imagePreview').style.display = 'block';
        updatePostBtnState();
    } catch (err) {
        console.error('Image compression failed:', err);
        showToast('Failed to process image');
    }
}

function removeSelectedImage() {
    pendingImageData = null;
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('imageInput').value = '';
    updatePostBtnState();
}

function updatePostBtnState() {
    const text = document.getElementById('postText').value.trim();
    const btn = document.getElementById('postBtn');
    btn.disabled = !text && !pendingImageData;
}

async function createPost() {
    const text = document.getElementById('postText').value.trim();
    if (!text && !pendingImageData) return;

    const btn = document.getElementById('postBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';

    try {
        const postData = {
            author: currentUser,
            text: text || '',
            imageData: pendingImageData || null,
            likes: {},
            commentCount: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await fdb.collection(POSTS_COLLECTION).add(postData);
        closeCreatePostModal();
        showToast('Posted! 💕');
    } catch (e) {
        console.error('Create post failed:', e);
        showToast('Failed to post. Try again.');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Post';
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
                let w = img.width;
                let h = img.height;

                if (w > IMAGE_MAX_WIDTH) {
                    h = Math.round((h * IMAGE_MAX_WIDTH) / w);
                    w = IMAGE_MAX_WIDTH;
                }

                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                const dataUrl = canvas.toDataURL('image/jpeg', IMAGE_QUALITY);
                resolve(dataUrl);
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

function closeImageViewer() {
    document.getElementById('imageViewer').style.display = 'none';
}

// ============ GALLERY ============

function renderGallery(posts) {
    const grid = document.getElementById('galleryGrid');
    const emptyEl = document.getElementById('galleryEmpty');

    if (!grid) return;

    // Extract all posts that have images, newest first
    const imagePosts = posts.filter(p => p.imageData);

    if (imagePosts.length === 0) {
        grid.innerHTML = '';
        grid.style.display = 'none';
        if (emptyEl) {
            emptyEl.classList.add('show');
        }
        return;
    }

    if (emptyEl) emptyEl.classList.remove('show');
    grid.style.display = 'grid';

    grid.innerHTML = imagePosts.map(p => {
        const lower = (p.author || 'a').toLowerCase();
        return `
            <div class="gallery-item" data-image="${p.imageData}">
                <img src="${p.imageData}" alt="Photo by ${p.author}" loading="lazy">
                <div class="gallery-author-dot user-${lower}">${p.author || '?'}</div>
            </div>`;
    }).join('');

    // Click to view image fullscreen
    grid.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', () => {
            openImageViewer(item.dataset.image);
        });
    });
}

// ============ PROFILE ============

function renderProfile() {
    if (!currentUser) return;

    const lower = currentUser.toLowerCase();
    const avatarClass = `user-${lower}`;
    const container = document.getElementById('profileContent');

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
                    <div class="profile-stat-label">Likes received</div>
                </div>
            </div>
        </div>
        <div class="profile-section-title">My Posts</div>
        <div id="profileGrid" class="profile-grid"></div>
        <div id="profileEmptyPosts" class="profile-empty-posts">No posts yet. Share your first moment!</div>
    `;

    // Load profile stats
    loadProfileStats();
}

function loadProfileStats() {
    // Listen to all posts for this user
    fdb.collection(POSTS_COLLECTION)
        .where('author', '==', currentUser)
        .orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
            let postCount = 0;
            let likeCount = 0;
            const imagePosts = [];

            snapshot.forEach(doc => {
                const data = doc.data();
                postCount++;
                likeCount += (data.likes ? Object.keys(data.likes).length : 0);
                if (data.imageData) {
                    imagePosts.push(data);
                }
            });

            // Update stats
            const postEl = document.getElementById('profilePostCount');
            const likeEl = document.getElementById('profileLikeCount');
            if (postEl) postEl.textContent = postCount;
            if (likeEl) likeEl.textContent = likeCount;

            // Update grid
            const grid = document.getElementById('profileGrid');
            const emptyEl = document.getElementById('profileEmptyPosts');
            if (!grid) return;

            if (imagePosts.length > 0) {
                grid.innerHTML = imagePosts.map(p => `
                    <div class="profile-grid-item" data-image="${p.imageData}">
                        <img src="${p.imageData}" alt="Post" loading="lazy">
                    </div>
                `).join('');
                grid.style.display = 'grid';
                if (emptyEl) emptyEl.style.display = 'none';

                // Click to view image
                grid.querySelectorAll('.profile-grid-item').forEach(item => {
                    item.addEventListener('click', () => {
                        openImageViewer(item.dataset.image);
                    });
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
        if (doc.exists && doc.data().date) {
            renderAnniversary(doc.data().date);
        } else {
            // No anniversary set yet
            document.getElementById('anniversaryBanner').style.display = 'none';
        }
    });
}

function renderAnniversary(dateStr) {
    const anniversary = new Date(dateStr);
    const now = new Date();

    // Calculate days
    const diffMs = now - anniversary;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Format the date nicely
    const dateFormatted = anniversary.toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric'
    });

    // Update DOM
    document.getElementById('anniDays').textContent = days;
    document.getElementById('anniDate').textContent = 'Since ' + dateFormatted;
    document.getElementById('anniversaryBanner').style.display = 'block';
}

async function setAnniversary(dateStr) {
    try {
        await fdb.collection(SETTINGS_COLLECTION).doc('anniversary').set({
            date: dateStr,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        showToast('Anniversary saved! 💕');
    } catch (e) {
        console.error('Save anniversary failed:', e);
        showToast('Failed to save anniversary');
    }
}

// ============ ANNIVERSARY EDITOR ============

function openAnniversaryEditor() {
    // Create a simple inline date picker modal
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
                <button class="btn-primary" style="margin-top:16px" onclick="saveAnniversaryFromEditor()">
                    <i class="fas fa-heart"></i> Save
                </button>
            </div>
        </div>
    `;
    overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.remove();
    });
    document.body.appendChild(overlay);
}

async function saveAnniversaryFromEditor() {
    const input = document.getElementById('anniDateInput');
    if (!input || !input.value) {
        showToast('Please select a date');
        return;
    }
    await setAnniversary(input.value);
    document.getElementById('anniversaryEditorModal').remove();
}

// ============ NAVIGATION ============

function switchScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.app-screen').forEach(s => s.classList.remove('active'));
    // Show target
    document.getElementById(screenId).classList.add('active');

    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.nav-btn[data-screen="${screenId}"]`).classList.add('active');

    // Show/hide FAB
    if (screenId === 'feedScreen') {
        document.getElementById('fabCreate').style.display = 'flex';
    } else {
        document.getElementById('fabCreate').style.display = 'none';
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
    toast._timeout = setTimeout(() => {
        toast.style.display = 'none';
    }, 2500);
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
