/**
 * ============================================================================
 * UEFI CONNECT & ENGAGE - FULL-STACK ENTERPRISE API CORE ENGINE
 * ============================================================================
 * Version: 3.0.0 (Persistent Storage & Full Interactive Media Edition)
 * Architecture: Node.js / Express / Native File-System (FS) Persistence
 * Features:
 * - Persistent JSON Database (Survives server restarts and browser reloads)
 * - Social Engagement Pipeline (Likes, Multi-user Comments, Timestamps)
 * - Rich Media Support (Image URLs, Video URLs, Embedded Captions)
 * - Advanced Security Shield (Brute-force lockout, Bearer Token Auth)
 * - Real-time Telemetry & Detailed Error Management
 * ============================================================================
 */

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();

// ============================================================================
// 1. PERSISTENT DATABASE STORAGE ENGINE (FILE-SYSTEM BACKED)
// ============================================================================
// By writing to local JSON files, your data will NEVER be erased when refreshing
// the browser or restarting the Node.js server terminal!

const USERS_FILE = path.join(__dirname, 'uefi_users_db.json');
const POSTS_FILE = path.join(__dirname, 'uefi_posts_db.json');

/**
 * Initializes physical database files if they do not exist yet on the hard drive.
 */
function initializeDatabase() {
    try {
        if (!fs.existsSync(USERS_FILE)) {
            fs.writeFileSync(USERS_FILE, JSON.stringify({}, null, 4), 'utf8');
            console.log(`[DATABASE INIT] Created new persistent users storage: ${USERS_FILE}`);
        }
        if (!fs.existsSync(POSTS_FILE)) {
            fs.writeFileSync(POSTS_FILE, JSON.stringify([], null, 4), 'utf8');
            console.log(`[DATABASE INIT] Created new persistent posts storage: ${POSTS_FILE}`);
        }
    } catch (err) {
        console.error("[DATABASE ERROR] Could not initialize physical storage files:", err);
    }
}

/**
 * Reads and parses the User Registry from disk.
 */
function getUserRegistry() {
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("[DATABASE READ ERROR] Failed to load user registry. Defaulting to empty object.", err);
        return {};
    }
}

/**
 * Saves the modified User Registry back to disk immediately.
 */
function saveUserRegistry(registryData) {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(registryData, null, 4), 'utf8');
    } catch (err) {
        console.error("[DATABASE WRITE ERROR] Failed to persist user registry to disk:", err);
    }
}

/**
 * Reads and parses the Global Feed Posts from disk.
 */
function getGlobalFeed() {
    try {
        const data = fs.readFileSync(POSTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("[DATABASE READ ERROR] Failed to load posts feed. Defaulting to empty array.", err);
        return [];
    }
}

/**
 * Saves the modified Global Feed Posts back to disk immediately.
 */
function saveGlobalFeed(feedData) {
    try {
        fs.writeFileSync(POSTS_FILE, JSON.stringify(feedData, null, 4), 'utf8');
    } catch (err) {
        console.error("[DATABASE WRITE ERROR] Failed to persist posts feed to disk:", err);
    }
}

// Run database initialization on server boot
initializeDatabase();

// ============================================================================
// 2. GLOBAL MIDDLEWARE & TELEMETRY CONFIGURATIONS
// ============================================================================

// Permit large payloads for media URLs and extended text articles
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Full Cross-Origin Resource Sharing (CORS) - Allows all classmates on different computers/networks to connect
app.use(cors({
    origin: '*', // Accepts web requests from any domain, IP, or local HTML file
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true
}));

// Real-Time Network Traffic Telemetry
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown IP';
    console.log(`[TELEMETRY] [${timestamp}] ${req.method} -> ${req.url} | Source: ${clientIp}`);
    next();
});

// ============================================================================
// 3. SECURITY & CRYPTOGRAPHY UTILITIES
// ============================================================================

/**
 * Generates an unpredictable, cryptographically secure alphanumeric token.
 */
function generateSecureAlphanumericToken(length = 6) {
    const characterPool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    try {
        const secureBytes = crypto.randomBytes(length);
        for (let i = 0; i < length; i++) {
            token += characterPool[secureBytes[i] % characterPool.length];
        }
        return token;
    } catch (error) {
        console.error("[CRYPTO ERROR] Entropy failure. Using mathematical fallback:", error);
        return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
    }
}

/**
 * Client Authentication Middleware Shield
 * Protects interactive routes (posting, liking, commenting) so only verified users can execute them.
 */
function requireClientAuthentication(req, res, next) {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Authentication Failed: Missing Authorization header. Please log in first."
        });
    }

    // Extract identifier (client passes email or token via: 'Bearer user@email.com')
    const clientIdentifier = authHeader.replace('Bearer ', '').toLowerCase().trim();
    const userRegistry = getUserRegistry();
    const activeProfile = userRegistry[clientIdentifier];

    if (!activeProfile) {
        return res.status(401).json({
            success: false,
            message: "Authentication Failed: Your user profile could not be located in the system."
        });
    }

    if (!activeProfile.isVerified) {
        return res.status(403).json({
            success: false,
            message: "Access Denied: You must verify your email address before interacting with the community."
        });
    }

    // Attach validated profile to the request for downstream processing
    req.authenticatedClient = activeProfile;
    next();
}

// ============================================================================
// 4. AUTHENTICATION & IDENTITY API ROUTES
// ============================================================================

/**
 * POST /api/auth/signup
 * Registers a new student/faculty profile and stores it persistently.
 */
app.post('/api/auth/signup', (req, res) => {
    const { email, name, role, password } = req.body;

    if (!email || !name || !role || !password) {
        return res.status(400).json({ 
            success: false, 
            message: "Registration Error: All fields (email, name, role, password) are strictly required." 
        });
    }

    const accountIdentifier = email.toLowerCase().trim();
    const userRegistry = getUserRegistry();

    if (userRegistry[accountIdentifier]) {
        return res.status(400).json({ 
            success: false, 
            message: "Registration Error: An account with this email address already exists." 
        });
    }

    const dispatchToken = generateSecureAlphanumericToken(6);
    
    userRegistry[accountIdentifier] = {
        name: name.trim(),
        email: accountIdentifier,
        role: role.trim(),
        password: password, // In live production, wrap this in bcrypt.hashSync(password, 10)
        isVerified: false,
        verificationToken: dispatchToken,
        failedAttempts: 0,
        isLocked: false,
        lockoutUntil: null,
        joinedAt: new Date().toISOString()
    };

    saveUserRegistry(userRegistry);

    console.log(`\n================================================================`);
    console.log(`[NEW MEMBER REGISTRATION]: ${name.trim()} (${accountIdentifier})`);
    console.log(`[VERIFICATION CODE DISPATCHED]: ${dispatchToken}  (CASE-SENSITIVE)`);
    console.log(`================================================================\n`);

    return res.status(201).json({
        success: true,
        message: "Registration successful! Check server console for your 6-character verification code.",
        email: accountIdentifier
    });
});

/**
 * POST /api/auth/verify
 * Verifies identity token and unlocks community access.
 */
app.post('/api/auth/verify', (req, res) => {
    const { email, token } = req.body;
    
    if (!email || !token) {
        return res.status(400).json({ success: false, message: "Verification Error: Both email and token are required." });
    }

    const accountIdentifier = email.toLowerCase().trim();
    const userRegistry = getUserRegistry();
    const targetProfile = userRegistry[accountIdentifier];

    if (!targetProfile) {
        return res.status(404).json({ success: false, message: "Verification Error: Account not found." });
    }

    // Check cooling period for locked accounts
    if (targetProfile.isLocked) {
        const timeNow = Date.now();
        if (timeNow < targetProfile.lockoutUntil) {
            const minutesLeft = Math.ceil((targetProfile.lockoutUntil - timeNow) / 1000 / 60);
            return res.status(423).json({
                success: false,
                message: `Security Lock: Account temporarily locked due to failed attempts. Try again in ${minutesLeft} minute(s).`
            });
        } else {
            targetProfile.isLocked = false;
            targetProfile.failedAttempts = 0;
            targetProfile.lockoutUntil = null;
        }
    }

    // Strict Case-Sensitive Code Comparison
    if (token === targetProfile.verificationToken) {
        targetProfile.isVerified = true;
        targetProfile.failedAttempts = 0;
        targetProfile.verificationToken = null;

        saveUserRegistry(userRegistry);

        return res.status(200).json({
            success: true,
            message: "Identity verified! You now have full access to post, comment, and like on UEFI Connect.",
            role: targetProfile.role,
            user: { name: targetProfile.name, email: targetProfile.email, role: targetProfile.role }
        });
    } else {
        targetProfile.failedAttempts += 1;
        const remainingChances = 5 - targetProfile.failedAttempts;

        if (targetProfile.failedAttempts >= 5) {
            targetProfile.isLocked = true;
            targetProfile.lockoutUntil = Date.now() + (15 * 60 * 1000); // 15 Minute Lockdown
            saveUserRegistry(userRegistry);
            return res.status(423).json({
                success: false,
                message: "Security Alert: 5 incorrect attempts recorded. Account locked for 15 minutes."
            });
        }

        saveUserRegistry(userRegistry);
        return res.status(400).json({
            success: false,
            message: "Invalid verification code. Remember, codes are strictly case-sensitive!",
            attemptsRemaining: remainingChances
        });
    }
});

/**
 * POST /api/auth/login
 * Standard account login.
 */
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Login Error: Email and password required." });
    }

    const accountIdentifier = email.toLowerCase().trim();
    const userRegistry = getUserRegistry();
    const targetProfile = userRegistry[accountIdentifier];

    if (!targetProfile || targetProfile.password !== password) {
        return res.status(401).json({ success: false, message: "Login Failed: Incorrect email or password." });
    }

    if (!targetProfile.isVerified) {
        return res.status(403).json({ 
            success: false, 
            message: "Account Unverified: Please complete email verification before logging in.", 
            requiresVerification: true 
        });
    }

    return res.status(200).json({
        success: true,
        message: "Login successful! Welcome back to UEFI Connect.",
        token: targetProfile.email, // Frontend must send this as: Authorization: Bearer <token>
        user: {
            name: targetProfile.name,
            email: targetProfile.email,
            role: targetProfile.role
        }
    });
});

// ============================================================================
// 5. COMMUNITY ECOSYSTEM API ROUTES (POSTS, MEDIA, LIKES, COMMENTS)
// ============================================================================

/**
 * GET /api/connect/posts
 * Fetches all discussion posts, including their attached images, videos, likes, and comments.
 * Tip for Frontend: Set a setInterval() in JavaScript to call this every 3 seconds to see classmates' posts automatically!
 */
app.get('/api/connect/posts', (req, res) => {
    const globalFeed = getGlobalFeed();
    return res.status(200).json({ 
        success: true, 
        totalPosts: globalFeed.length,
        feed: globalFeed 
    });
});

/**
 * POST /api/connect/posts
 * Publishes a new post with optional Image URL and Video URL support.
 */
app.post('/api/connect/posts', requireClientAuthentication, (req, res) => {
    const { textContent, imageUrl, videoUrl } = req.body;
    const activeClient = req.authenticatedClient;

    if (!textContent || textContent.trim() === "") {
        return res.status(400).json({ success: false, message: "Post Error: You cannot publish an empty message." });
    }

    const globalFeed = getGlobalFeed();

    // Comprehensive Post Schema with built-in interactive arrays
    const newPostObject = {
        id: crypto.randomUUID(),
        authorEmail: activeClient.email,
        authorName: activeClient.name,
        authorRole: activeClient.role,
        textContent: textContent.trim(),
        imageUrl: imageUrl && imageUrl.trim() !== "" ? imageUrl.trim() : null,
        videoUrl: videoUrl && videoUrl.trim() !== "" ? videoUrl.trim() : null,
        likes: [],       // Array of user emails who liked the post
        likesCount: 0,   // Numerical tally for easy UI rendering
        comments: [],    // Array of nested comment objects
        commentsCount: 0,
        timestamp: new Date().toISOString()
    };

    // Add new post to the top of the feed and save to hard drive
    globalFeed.unshift(newPostObject);
    saveGlobalFeed(globalFeed);
    
    console.log(`[NEW POST PUBLISHED] Author: ${activeClient.name} | Media Attached: ${imageUrl ? 'Image ' : ''}${videoUrl ? 'Video' : 'None'}`);

    return res.status(201).json({ 
        success: true, 
        message: "Your post has been published to the global ecosystem!", 
        post: newPostObject 
    });
});

/**
 * POST /api/connect/posts/:id/like
 * Toggles a Like on a specific classmate's post.
 * If the user already liked it, calling this endpoint again removes their like (Unlike).
 */
app.post('/api/connect/posts/:id/like', requireClientAuthentication, (req, res) => {
    const targetPostId = req.params.id;
    const activeClient = req.authenticatedClient;
    const globalFeed = getGlobalFeed();

    const postIndex = globalFeed.findIndex(post => post.id === targetPostId);

    if (postIndex === -1) {
        return res.status(404).json({ success: false, message: "Interaction Error: The requested post does not exist." });
    }

    const targetPost = globalFeed[postIndex];

    // Ensure likes array exists (for backward compatibility)
    if (!targetPost.likes) targetPost.likes = [];

    const userLikeIndex = targetPost.likes.indexOf(activeClient.email);

    let actionTaken = "";
    if (userLikeIndex === -1) {
        // Add Like
        targetPost.likes.push(activeClient.email);
        actionTaken = "liked";
    } else {
        // Remove Like (Unlike)
        targetPost.likes.splice(userLikeIndex, 1);
        actionTaken = "unliked";
    }

    targetPost.likesCount = targetPost.likes.length;
    saveGlobalFeed(globalFeed);

    console.log(`[LIKE INTERACTION] ${activeClient.name} ${actionTaken} post ID: ${targetPostId}`);

    return res.status(200).json({
        success: true,
        message: `Successfully ${actionTaken} the post!`,
        likesCount: targetPost.likesCount,
        likes: targetPost.likes
    });
});

/**
 * POST /api/connect/posts/:id/comment
 * Allows users to reply and comment on a specific classmate's post.
 */
app.post('/api/connect/posts/:id/comment', requireClientAuthentication, (req, res) => {
    const targetPostId = req.params.id;
    const { commentText } = req.body;
    const activeClient = req.authenticatedClient;

    if (!commentText || commentText.trim() === "") {
        return res.status(400).json({ success: false, message: "Comment Error: Please enter text before submitting your comment." });
    }

    const globalFeed = getGlobalFeed();
    const postIndex = globalFeed.findIndex(post => post.id === targetPostId);

    if (postIndex === -1) {
        return res.status(404).json({ success: false, message: "Interaction Error: The requested post does not exist." });
    }

    const targetPost = globalFeed[postIndex];

    // Ensure comments array exists
    if (!targetPost.comments) targetPost.comments = [];

    const newCommentObject = {
        commentId: crypto.randomUUID(),
        authorEmail: activeClient.email,
        authorName: activeClient.name,
        authorRole: activeClient.role,
        text: commentText.trim(),
        timestamp: new Date().toISOString()
    };

    targetPost.comments.push(newCommentObject);
    targetPost.commentsCount = targetPost.comments.length;

    saveGlobalFeed(globalFeed);

    console.log(`[NEW COMMENT] ${activeClient.name} commented on post ID: ${targetPostId}`);

    return res.status(201).json({
        success: true,
        message: "Your comment has been added!",
        comment: newCommentObject,
        totalComments: targetPost.commentsCount
    });
});

/**
 * DELETE /api/connect/posts/:id
 * Allows a user to delete their own post.
 */
app.delete('/api/connect/posts/:id', requireClientAuthentication, (req, res) => {
    const targetPostId = req.params.id;
    const activeClient = req.authenticatedClient;
    const globalFeed = getGlobalFeed();

    const postIndex = globalFeed.findIndex(post => post.id === targetPostId);

    if (postIndex === -1) {
        return res.status(404).json({ success: false, message: "Delete Error: Post not found." });
    }

    // Authorization check: Only the original author can delete their post
    if (globalFeed[postIndex].authorEmail !== activeClient.email) {
        return res.status(403).json({ success: false, message: "Permission Denied: You can only delete your own posts." });
    }

    globalFeed.splice(postIndex, 1);
    saveGlobalFeed(globalFeed);

    console.log(`[POST DELETED] Post ID ${targetPostId} removed by ${activeClient.name}`);

    return res.status(200).json({ success: true, message: "Your post has been permanently deleted." });
});

// ============================================================================
// 6. FALLBACK ERROR HANDLERS
// ============================================================================

// 404 Route Catch-All Shield
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Endpoint Not Found: [${req.method}] ${req.url} is not a valid route on this server.`
    });
});

// 500 Internal Exception Catch-All Shield
app.use((err, req, res, next) => {
    console.error("[CRITICAL SYSTEM EXCEPTION]:", err.stack);
    res.status(500).json({
        success: false,
        message: "Internal Server Error: The server encountered an unexpected condition."
    });
});

// ============================================================================
// 7. SERVER INITIALIZATION & PORT ACTIVATION
// ============================================================================
const SERVER_PORT = process.env.PORT || 5000;
app.listen(SERVER_PORT, () => {
    console.log(`\n================================================================`);
    console.log(`[UEFI ENTERPRISE CORE ONLINE] Version 3.0.0 Active`);
    console.log(`[PERSISTENCE ACTIVE] Storing data locally in JSON files.`);
    console.log(`[LISTENING PORT] Socket communications mapped to port: ${SERVER_PORT}`);
    console.log(`================================================================\n`);
});
