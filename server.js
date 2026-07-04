/**
 * ============================================================================
 * UEFI CONNECT & ENGAGE - ENTERPRISE BACKEND ARCHITECTURE
 * ============================================================================
 * Version: 4.1.0 (Production Core Engine Simulation)
 * Core System: Node.js / Express Architecture
 * Storage Stratum: Local Hard-Drive File Persistence (JSON Database Engine)
 * Framework Rules: Absolute Route Safety, Deep State Mapping, Interactive Feeds
 * ============================================================================
 */

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();

// --- PHYSICAL DATABASE CONFIGURATION STRATUM ---
const USERS_DB_PATH = path.join(__dirname, 'uefi_users_persistent_db.json');
const POSTS_DB_PATH = path.join(__dirname, 'uefi_posts_persistent_db.json');

/**
 * Initializes and locks structural database paths to disk if missing.
 */
function verifyAndBootstrappedPhysicalStorage() {
    try {
        if (!fs.existsSync(USERS_DB_PATH)) {
            fs.writeFileSync(USERS_DB_PATH, JSON.stringify({}, null, 4), 'utf8');
            console.log(`[STORAGE ENGINE] Initialized clean user vault file path: ${USERS_DB_PATH}`);
        }
        if (!fs.existsSync(POSTS_DB_PATH)) {
            fs.writeFileSync(POSTS_DB_PATH, JSON.stringify([], null, 4), 'utf8');
            console.log(`[STORAGE ENGINE] Initialized clean interactive feed vault file path: ${POSTS_DB_PATH}`);
        }
    } catch (criticalInitializationError) {
        console.error("[CRITICAL FATAL STORAGE ERROR] Hard drive write access blocked:", criticalInitializationError);
    }
}

// Execute disk binding verification sequence
verifyAndBootstrappedPhysicalStorage();

/**
 * Thread-Safe Read Interface: Extracts Active User Profiles Array from Disk
 */
function fetchSystemUserRegistry() {
    try {
        const structuralDataBlob = fs.readFileSync(USERS_DB_PATH, 'utf8');
        return JSON.parse(structuralDataBlob);
    } catch (readError) {
        console.error("[STORAGE READ FAILURE] Re-routing empty virtual register frame:", readError);
        return {};
    }
}

/**
 * Thread-Safe Write Interface: Commits Virtual Registry States Directly to Disk
 */
function commitSystemUserRegistry(registryPayload) {
    try {
        fs.writeFileSync(USERS_DB_PATH, JSON.stringify(registryPayload, null, 4), 'utf8');
    } catch (writeError) {
        console.error("[STORAGE WRITE ATTEMPT FLUNKED] Data could not secure disk sync:", writeError);
    }
}

/**
 * Thread-Safe Read Interface: Extracts Active Global Communication Feeds
 */
function fetchGlobalEcosystemFeed() {
    try {
        const structuralFeedBlob = fs.readFileSync(POSTS_DB_PATH, 'utf8');
        return JSON.parse(structuralFeedBlob);
    } catch (readError) {
        console.error("[FEED READ FAILURE] Re-routing clean virtual feed matrix array:", readError);
        return [];
    }
}

/**
 * Thread-Safe Write Interface: Commits Virtual Community Feed Arrays Directly to Disk
 */
function commitGlobalEcosystemFeed(feedPayload) {
    try {
        fs.writeFileSync(POSTS_DB_PATH, JSON.stringify(feedPayload, null, 4), 'utf8');
    } catch (writeError) {
        console.error("[FEED WRITE ATTEMPT FLUNKED] Feed stream drop blocked allocation:", writeError);
    }
}

// --- NETWORK CORE CONFIGURATIONS & INTERCEPTORS ---

// Expand incoming request thresholds to easily parse embedded images and base64 video media streams
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Absolute CORS permissions matrix allows connections from external peer systems on the network
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true
}));

// Real-Time High-Fidelity Network Client Telemetry Logger
app.use((req, res, next) => {
    const accessTimestamp = new Date().toISOString();
    const inboundIPAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '0.0.0.0';
    console.log(`[NET TELEMETRY] [${accessTimestamp}] ROUTE ACTION: ${req.method} -> Target: ${req.url} | Inbound IP Node: ${inboundIPAddress}`);
    next();
});

// --- CORE SECURITY SCHEMAS & MIDDLEWARE SHIELDS ---

/**
 * Crypto-Engine Secure Token Generator
 */
function generateSecureAlphanumericToken(length = 6) {
    const tokenCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let outputToken = '';
    try {
        const cryptographicallySecureBytes = crypto.randomBytes(length);
        for (let loopIndex = 0; loopIndex < length; loopIndex++) {
            outputToken += tokenCharacters[cryptographicallySecureBytes[loopIndex] % tokenCharacters.length];
        }
        return outputToken;
    } catch (cryptoEntropyException) {
        console.warn("[SECURITY ENGINE] Cryptographic entropy failure, matching pseudorandom layout alternative.", cryptoEntropyException);
        return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
    }
}

/**
 * Authorization Guard Interceptor Middle-tier
 */
function securePipelineAuthenticationGuard(req, res, next) {
    const rawAuthorizationHeader = req.headers['authorization'];
    
    if (!rawAuthorizationHeader) {
        return res.status(401).json({
            success: false,
            message: "Access Terminated: Security context header missing. Please execute workspace login."
        });
    }

    const compiledClientEmailKey = rawAuthorizationHeader.replace('Bearer ', '').toLowerCase().trim();
    const activeRegistrySnapshot = fetchSystemUserRegistry();
    const verifiedAccountProfile = activeRegistrySnapshot[compiledClientEmailKey];

    if (!verifiedAccountProfile) {
        return res.status(401).json({
            success: false,
            message: "Access Terminated: Token structural mismatch. Identity path invalid."
        });
    }

    if (!verifiedAccountProfile.isVerified) {
        return res.status(403).json({
            success: false,
            message: "Access Forbidden: Community access locked until alphanumeric setup token is confirmed."
        });
    }

    req.authenticatedUserContext = verifiedAccountProfile;
    next();
}

// --- CORE API INTERACTIVE ROUTING GRID ---

/**
 * POST /api/auth/signup -> Account Initialization Route
 */
app.post('/api/auth/signup', (req, res) => {
    const { email, name, role, password } = req.body;

    if (!email || !name || !role || !password) {
        return res.status(400).json({ 
            success: false, 
            message: "Schema Error: Core attributes missing. Verification requirements: Email, Name, Role, Password." 
        });
    }

    const optimizedEmailIdentifier = email.toLowerCase().trim();
    const currentRegistryInstance = fetchSystemUserRegistry();

    if (currentRegistryInstance[optimizedEmailIdentifier]) {
        return res.status(400).json({ 
            success: false, 
            message: "Identity Conflict: A registration profile already points to this email layout path." 
        });
    }

    const operationalValidationToken = generateSecureAlphanumericToken(6);
    
    currentRegistryInstance[optimizedEmailIdentifier] = {
        name: name.trim(),
        email: optimizedEmailIdentifier,
        role: role.trim(),
        password: password, 
        isVerified: false,
        verificationToken: operationalValidationToken,
        failedAttempts: 0,
        isLocked: false,
        lockoutUntil: null,
        createdOn: new Date().toISOString()
    };

    commitSystemUserRegistry(currentRegistryInstance);

    console.log(`\n================================================================`);
    console.log(`[IDENTITY HUB REGISTRATION]: ${name.trim()} [${optimizedEmailIdentifier}]`);
    console.log(`[DISPATCHED CHALLENGE PASSCODE]: ${operationalValidationToken} (CASE-SENSITIVE)`);
    console.log(`================================================================\n`);

    return res.status(201).json({
        success: true,
        message: "Ecosystem identity structure staged. Grab your authorization code from your backend execution console log.",
        email: optimizedEmailIdentifier
    });
});

/**
 * POST /api/auth/verify -> Secure Challenge Passcode Verification
 */
app.post('/api/auth/verify', (req, res) => {
    const { email, token } = req.body;
    
    if (!email || !token) {
        return res.status(400).json({ success: false, message: "Verification Blocked: Matching attributes missing." });
    }

    const optimizedEmailIdentifier = email.toLowerCase().trim();
    const currentRegistryInstance = fetchSystemUserRegistry();
    const targetingUserMetadata = currentRegistryInstance[optimizedEmailIdentifier];

    if (!targetingUserMetadata) {
        return res.status(404).json({ success: false, message: "Verification Blocked: Account reference matches no profile." });
    }

    if (targetingUserMetadata.isLocked) {
        const wallClockTime = Date.now();
        if (wallClockTime < targetingUserMetadata.lockoutUntil) {
            const coolingWindowRemaining = Math.ceil((targetingUserMetadata.lockoutUntil - wallClockTime) / 1000 / 60);
            return res.status(423).json({
                success: false,
                message: `Brute-force Lockdown Engaged: Access frozen. Try again in ${coolingWindowRemaining} minute(s).`
            });
        } else {
            targetingUserMetadata.isLocked = false;
            targetingUserMetadata.failedAttempts = 0;
            targetingUserMetadata.lockoutUntil = null;
        }
    }

    if (token === targetingUserMetadata.verificationToken) {
        targetingUserMetadata.isVerified = true;
        targetingUserMetadata.failedAttempts = 0;
        targetingUserMetadata.verificationToken = null;

        commitSystemUserRegistry(currentRegistryInstance);

        return res.status(200).json({
            success: true,
            message: "Identity confirmed successfully! Platform interactive clearances mapped.",
            user: { name: targetingUserMetadata.name, email: targetingUserMetadata.email, role: targetingUserMetadata.role }
        });
    } else {
        targetingUserMetadata.failedAttempts += 1;
        const fallbackOpportunities = 5 - targetingUserMetadata.failedAttempts;

        if (targetingUserMetadata.failedAttempts >= 5) {
            targetingUserMetadata.isLocked = true;
            targetingUserMetadata.lockoutUntil = Date.now() + (15 * 60 * 1000); 
            commitSystemUserRegistry(currentRegistryInstance);
            return res.status(423).json({
                success: false,
                message: "Security Lockout Triggered: 5 sequential mismatches handled. Account locked for 15 minutes."
            });
        }

        commitSystemUserRegistry(currentRegistryInstance);
        return res.status(400).json({
            success: false,
            message: "Validation structure error. Code string checks are case-sensitive.",
            attemptsRemaining: fallbackOpportunities
        });
    }
});

/**
 * POST /api/auth/login -> User Workspace Credential Checking
 */
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Login Validation Error: Target parameters incomplete." });
    }

    const optimizedEmailIdentifier = email.toLowerCase().trim();
    const currentRegistryInstance = fetchSystemUserRegistry();
    const targetingUserMetadata = currentRegistryInstance[optimizedEmailIdentifier];

    if (!targetingUserMetadata || targetingUserMetadata.password !== password) {
        return res.status(401).json({ success: false, message: "Credentials Evaluation Faulted: Unauthorized parameters match." });
    }

    if (!targetingUserMetadata.isVerified) {
        return res.status(403).json({ 
            success: false, 
            message: "Access Deficient: Verification sequence missing or uncompleted.", 
            requiresVerification: true 
        });
    }

    return res.status(200).json({
        success: true,
        message: "Identity confirmed. Deploying custom application workspaces...",
        token: targetingUserMetadata.email,
        user: { name: targetingUserMetadata.name, email: targetingUserMetadata.email, role: targetingUserMetadata.role }
    });
});

/**
 * GET /api/connect/posts -> Synchronized Communication Stream Dispatcher
 */
app.get('/api/connect/posts', (req, res) => {
    const systemFeedSnapshot = fetchGlobalEcosystemFeed();
    return res.status(200).json({ 
        success: true, 
        totalTelemetryItems: systemFeedSnapshot.length,
        feed: systemFeedSnapshot 
    });
});

/**
 * POST /api/connect/posts -> Multi-media Asset Publishing Route
 */
app.post('/api/connect/posts', securePipelineAuthenticationGuard, (req, res) => {
    const { textContent, imageUrl, videoUrl } = req.body;
    const authorContext = req.authenticatedUserContext;

    if (!textContent || textContent.trim() === "") {
        return res.status(400).json({ success: false, message: "Publishing Faulted: Input message cannot be empty." });
    }

    const totalSystemFeed = fetchGlobalEcosystemFeed();

    const newlyStructuredPost = {
        id: crypto.randomUUID(),
        authorEmail: authorContext.email,
        authorName: authorContext.name,
        authorRole: authorContext.role,
        textContent: textContent.trim(),
        imageUrl: imageUrl && imageUrl.trim() !== "" ? imageUrl.trim() : null,
        videoUrl: videoUrl && videoUrl.trim() !== "" ? videoUrl.trim() : null,
        likes: [],       
        likesCount: 0,   
        comments: [],    
        commentsCount: 0,
        timestamp: new Date().toISOString()
    };

    totalSystemFeed.unshift(newlyStructuredPost);
    commitGlobalEcosystemFeed(totalSystemFeed);

    return res.status(201).json({ 
        success: true, 
        message: "Academic asset securely stored in persistent global feed registry.", 
        post: newlyStructuredPost 
    });
});

/**
 * POST /api/connect/posts/:id/like -> Interactive Like Matrix Toggle Engine
 */
app.post('/api/connect/posts/:id/like', securePipelineAuthenticationGuard, (req, res) => {
    const postIdentityTarget = req.params.id;
    const userContext = req.authenticatedUserContext;
    const activeFeedSnapshot = fetchGlobalEcosystemFeed();

    const structuralPostIndex = activeFeedSnapshot.findIndex(item => item.id === postIdentityTarget);

    if (structuralPostIndex === -1) {
        return res.status(404).json({ success: false, message: "Target Context Failure: Post asset reference does not exist." });
    }

    const postReference = activeFeedSnapshot[structuralPostIndex];
    if (!postReference.likes) postReference.likes = [];

    const uniqueUserIndex = postReference.likes.indexOf(userContext.email);
    let engagementVector = "";

    if (uniqueUserIndex === -1) {
        postReference.likes.push(userContext.email);
        engagementVector = "liked";
    } else {
        postReference.likes.splice(uniqueUserIndex, 1);
        engagementVector = "unliked";
    }

    postReference.likesCount = postReference.likes.length;
    commitGlobalEcosystemFeed(activeFeedSnapshot);

    return res.status(200).json({
        success: true,
        message: `Asset successfully ${engagementVector}!`,
        likesCount: postReference.likesCount,
        likes: postReference.likes
    });
});

/**
 * POST /api/connect/posts/:id/comment -> Nested Response Injection Pipeline
 */
app.post('/api/connect/posts/:id/comment', securePipelineAuthenticationGuard, (req, res) => {
    const postIdentityTarget = req.params.id;
    const { commentText } = req.body;
    const userContext = req.authenticatedUserContext;

    if (!commentText || commentText.trim() === "") {
        return res.status(400).json({ success: false, message: "Response Rejected: Text payload body is mandatory." });
    }

    const activeFeedSnapshot = fetchGlobalEcosystemFeed();
    const structuralPostIndex = activeFeedSnapshot.findIndex(item => item.id === postIdentityTarget);

    if (structuralPostIndex === -1) {
        return res.status(404).json({ success: false, message: "Target Context Failure: Post asset reference does not exist." });
    }

    const postReference = activeFeedSnapshot[structuralPostIndex];
    if (!postReference.comments) postReference.comments = [];

    const newlyCompiledCommentNode = {
        commentId: crypto.randomUUID(),
        authorEmail: userContext.email,
        authorName: userContext.name,
        authorRole: userContext.role,
        text: commentText.trim(),
        timestamp: new Date().toISOString()
    };

    postReference.comments.push(newlyCompiledCommentNode);
    postReference.commentsCount = postReference.comments.length;

    commitGlobalEcosystemFeed(activeFeedSnapshot);

    return res.status(201).json({
        success: true,
        message: "Nested platform feedback appended securely.",
        comment: newlyCompiledCommentNode,
        totalComments: postReference.commentsCount
    });
});

// --- PLATFORM CATCH-ALL PROTECTION SYSTEM SHIELDS ---
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Routing Fault: System asset path missing from mapping registry." });
});

app.use((err, req, res, next) => {
    console.error("[CENTRAL SECURITY EXCEPTION EXPOSED]:", err.stack);
    res.status(500).json({ success: false, message: "Internal Processing Exception: Frame parse failed." });
});

const INTERACTIVE_RUN_PORT = process.env.PORT || 5000;
app.listen(INTERACTIVE_RUN_PORT, '0.0.0.0', () => {
    console.log(`\n================================================================`);
    console.log(`[UEFI PRODUCTION CORE ONLINE] Active Global Systems Engaged.`);
    console.log(`[NET ADAPTER BINDING] Mapping interfaces on host channel port: ${INTERACTIVE_RUN_PORT}`);
    console.log(`================================================================\n`);
});
