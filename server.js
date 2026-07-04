/**
 * ============================================================================
 * UEFI CONNECT & ENGAGE - ADVANCED ENTERPRISE API CORE ENGINE
 * ============================================================================
 * Architecture: Node.js / Express Client-Facing Application Layer
 * Current Phase: High-Fidelity Simulation Sandbox (In-Memory State Engine)
 * Features: Telemetry Tracking, Route Protection, Brute-Force Shielding
 * ============================================================================
 */

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();

// --- STATE ARCHITECTURE VOLUMES (Simulated Database Layer) ---
const userRegistry = {};       // Structural Mapping: Email String -> User Profile Object
const globalEcosystemFeed = []; // Core Stream Array: Retains Published Academic & Interactive Assets

// --- GLOBAL MIDDLEWARE CONFIGURATIONS & TELEMETRY ---

// Standard JSON request body parsing configuration
app.use(express.json());

// Enhanced CORS Configuration optimized for cross-origin web client applications
app.use(cors({
    origin: '*', // In production, replace with specific domains like ['https://yourclientapp.com']
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
}));

// Real-Time Client Traffic Telemetry Middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log(`[NETWORK TELEMETRY] [${timestamp}] ${req.method} -> ${req.url} | Source IP: ${clientIp}`);
    next();
});

// --- CORE UTILITY & SECURITY PROTOCOLS ---

/**
 * Generates an unpredictable, highly complex case-sensitive alphanumeric token.
 * Utilizes cryptographically secure pseudo-random bytes to mitigate prediction attacks.
 * @param {number} length - Desired character length of the token
 * @returns {string} 
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
        console.error("[CRITICAL CRYPTO ERROR] Failed to source secure entropy:", error);
        // Fallback pseudorandom string generation strategy if entropy collection fails
        return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
    }
}

/**
 * Client Authorization Shield Middleware
 * Intercepts protected operations to confirm client status, identity validation, and execution rules.
 */
function requireClientAuthentication(req, res, next) {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Access Denied: Missing client validation credentials (Authorization Header required)."
        });
    }

    // In this simulation, clients provide their target email identifier as a primitive token
    const clientIdentifier = authHeader.replace('Bearer ', '').toLowerCase().trim();
    const activeProfile = userRegistry[clientIdentifier];

    if (!activeProfile) {
        return res.status(401).json({
            success: false,
            message: "Authentication Invalid: Client token does not match any registered identity structures."
        });
    }

    if (!activeProfile.isVerified) {
        return res.status(403).json({
            success: false,
            message: "Access Forbidden: Client identity must fulfill token verification routines first."
        });
    }

    // Attach verified profile data payload directly to the request object for use down-pipeline
    req.authenticatedClient = activeProfile;
    next();
}

// --- CORE API ROUTING ENGINE ---

/**
 * 1. IDENTITY REGISTRATION ROUTE
 * Registers brand new user accounts and provisions their dynamic verification infrastructure.
 */
app.post('/api/auth/signup', (req, res) => {
    const { email, name, role, password } = req.body;

    // Strict input parameter presence checks
    if (!email || !name || !role || !password) {
        return res.status(400).json({ 
            success: false, 
            message: "Initialization failure: All registration fields (email, name, role, password) are mandatory." 
        });
    }

    const accountIdentifier = email.toLowerCase().trim();

    // Verify system non-duplication constraints
    if (userRegistry[accountIdentifier]) {
        return res.status(400).json({ 
            success: false, 
            message: "Registration failure: A profile already exists under this email path." 
        });
    }

    // Provision complex security token configurations
    const dispatchToken = generateSecureAlphanumericToken(6);
    
    // Construct database schema mock setup
    userRegistry[accountIdentifier] = {
        name: name.trim(),
        email: accountIdentifier,
        role: role.trim(),
        password: password, // PRO-TIP: Substitute with a robust framework like 'bcrypt' in live production
        isVerified: false,
        verificationToken: dispatchToken,
        failedAttempts: 0,
        isLocked: false,
        lockoutUntil: null,
        sessionToken: null
    };

    // DEVELOPMENT TERMINAL OUTPUT LOG - Simulates SMS/Email network dispatching layers
    console.log(`\n======================================================`);
    console.log(`[UEFI IDENTITY ENGAGEMENT DETECTED]: ${accountIdentifier}`);
    console.log(`[VERIFICATION TOKEN ENCLOSED]: ${dispatchToken}  (STRICT CASE-SENSITIVE)`);
    console.log(`======================================================\n`);

    return res.status(201).json({
        success: true,
        message: "Ecosystem enrollment successful. Verification token dispatched to backend console parameters.",
        email: accountIdentifier
    });
});

/**
 * 2. IDENTITY CONFIRMATION & BRUTE-FORCE COUNTERMEASURES
 * Handles code checks and tracks error counters to dynamically lock down profiles.
 */
app.post('/api/auth/verify', (req, res) => {
    const { email, token } = req.body;
    
    if (!email || !token) {
        return res.status(400).json({ success: false, message: "Missing matching target attributes (email and token required)." });
    }

    const accountIdentifier = email.toLowerCase().trim();
    const targetProfile = userRegistry[accountIdentifier];

    if (!targetProfile) {
        return res.status(404).json({ success: false, message: "Ecosystem entity record absent from catalog." });
    }

    // Evaluate active lockout boundaries
    if (targetProfile.isLocked) {
        const timeNow = Date.now();
        if (timeNow < targetProfile.lockoutUntil) {
            const structuralRemainingWait = Math.ceil((targetProfile.lockoutUntil - timeNow) / 1000 / 60);
            return res.status(423).json({
                success: false,
                message: `Security Access Restriction: Account locked due to structural violations. Cooling window remaining: ${structuralRemainingWait} minute(s).`
            });
        } else {
            // Automatically clear restriction parameters once the lock duration expires
            targetProfile.isLocked = false;
            targetProfile.failedAttempts = 0;
            targetProfile.lockoutUntil = null;
            console.log(`[SECURITY SYSTEM] Cooling period completed. Restored access parameters for: ${accountIdentifier}`);
        }
    }

    // CRITICAL SECURITY RULE: Explicit Case-Sensitive Evaluation
    if (token === targetProfile.verificationToken) {
        targetProfile.isVerified = true;
        targetProfile.failedAttempts = 0;
        targetProfile.verificationToken = null; // Purge layout variable upon successful validation match

        return res.status(200).json({
            success: true,
            message: "Identity confirmed successfully! Access granted to UEFI Connect & Engage platforms.",
            role: targetProfile.role
        });
    } else {
        // Log miscalculation and increment attempt tracking index
        targetProfile.failedAttempts += 1;
        const remainingChances = 5 - targetProfile.failedAttempts;

        console.warn(`[SECURITY WARN] Bad verification attempt matching pattern for ${accountIdentifier}. Bad runs: ${targetProfile.failedAttempts}/5`);

        if (targetProfile.failedAttempts >= 5) {
            targetProfile.isLocked = true;
            targetProfile.lockoutUntil = Date.now() + (15 * 60 * 1000); // 15-Minute Structural System Lockdown Block
            return res.status(423).json({
                success: false,
                message: "Security breach alert: 5 failed token match events registered. Profile locked for 15 minutes."
            });
        }

        return res.status(400).json({
            success: false,
            message: `Verification code string structure error. Case-sensitive matching failed.`,
            attemptsRemaining: remainingChances
        });
    }
});

/**
 * 3. TOKEN RE-DISPATCH ARCHITECTURE
 * Re-routes a fresh unique string value if the previous code was lost.
 */
app.post('/api/auth/resend', (req, res) => {
    const { email } = req.body;
    
    if (!email) return res.status(400).json({ success: false, message: "Email attribute required." });

    const accountIdentifier = email.toLowerCase().trim();
    const targetProfile = userRegistry[accountIdentifier];

    if (!targetProfile) {
        return res.status(404).json({ success: false, message: "Ecosystem entity record absent from catalog." });
    }

    if (targetProfile.isLocked) {
        return res.status(423).json({ success: false, message: "Security parameters active: User locked. Cannot refresh token elements." });
    }

    const secondaryToken = generateSecureAlphanumericToken(6);
    targetProfile.verificationToken = secondaryToken;
    targetProfile.failedAttempts = 0; // Reset history metric tracking block

    console.log(`\n======================================================`);
    console.log(`[TOKEN RE-DISPATCHED FOR]: ${accountIdentifier}`);
    console.log(`[REFRESHED TOKEN VALUE]: ${secondaryToken}`);
    console.log(`======================================================\n`);

    return res.status(200).json({ success: true, message: "A fresh alphanumeric validation layout has been sent." });
});

/**
 * 4. STANDARD ACCOUNT ENTRY POINT
 * Validates identity passwords and creates a token verification configuration for client sessions.
 */
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Missing required credential inputs (email and password required)." });
    }

    const accountIdentifier = email.toLowerCase().trim();
    const targetProfile = userRegistry[accountIdentifier];

    // Catch credentials mismatch cleanly without leaking structural details
    if (!targetProfile || targetProfile.password !== password) {
        return res.status(401).json({ success: false, message: "Access rejected: Invalid entry parameters." });
    }

    // Intercept client path if identity has skipped registration validation steps
    if (!targetProfile.isVerified) {
        return res.status(403).json({ 
            success: false, 
            message: "Verification pending: Complete identity confirmation requirements first.", 
            requiresVerification: true 
        });
    }

    // Generate dynamic mock system session token (maps email identification framework for clients)
    targetProfile.sessionToken = `mock-session-jwt-${generateSecureAlphanumericToken(16)}`;

    return res.status(200).json({
        success: true,
        message: "Credentials valid. Loading workspace configurations...",
        token: targetProfile.email, // Client places this identifier code inside the 'Authorization' Header
        user: {
            name: targetProfile.name,
            email: targetProfile.email,
            role: targetProfile.role
        }
    });
});

/**
 * 5. UEFI ENGAGE / CONNECT: PUBLISH CONTENT PIPELINE [PROTECTED ROUTE]
 * Access restricted exclusively to validated, matching ecosystem profile frameworks.
 */
app.post('/api/connect/posts', requireClientAuthentication, (req, res) => {
    const { textContent, videoUrl } = req.body;
    
    // Extract metadata injected securely by the authentication middleware shield
    const activeClient = req.authenticatedClient;

    if (!textContent || textContent.trim() === "") {
        return res.status(400).json({ success: false, message: "Unable to process incomplete transmission variables: Content text empty." });
    }

    const compiledPostObject = {
        id: crypto.randomUUID(),
        authorEmail: activeClient.email,
        authorName: activeClient.name,
        authorRole: activeClient.role,
        textContent: textContent,
        videoUrl: videoUrl || null, 
        likes: 0,
        timestamp: new Date().toISOString()
    };

    globalEcosystemFeed.unshift(compiledPostObject); // Enforces new material delivery to the apex of the payload feed
    
    return res.status(201).json({ 
        success: true, 
        message: "Academic asset securely stored in global network hub registry.", 
        post: compiledPostObject 
    });
});

/**
 * 6. UEFI ENGAGE / CONNECT: DELIVER MULTI-CHANNEL INDEX [PUBLIC READ ROUTE]
 * Transmits public stream data configurations to any authenticated or listening visual dashboards.
 */
app.get('/api/connect/posts', (req, res) => {
    return res.status(200).json({ 
        success: true, 
        count: globalEcosystemFeed.length,
        feed: globalEcosystemFeed 
    });
});

// --- CENTRAL SYSTEM FALLBACK & ERROR HANDLERS ---

// Handles mismatched route pathways (404 Fallback Shield)
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Resource Execution Error: Requested path [${req.method}] ${req.url} does not exist.`
    });
});

// Structural internal pipeline exception catcher (500 Protection Shield)
app.use((err, req, res, next) => {
    console.error("[CRITICAL PROCESS ERROR HANDLER]:", err.stack);
    res.status(500).json({
        success: false,
        message: "Internal Server Processing Exception: The engine was unable to parse this request frame."
    });
});

// --- EXECUTION CONTROL CONTROLLER ---
const SERVER_PORT = process.env.PORT || 5000;
app.listen(SERVER_PORT, () => {
    console.log(`\n================================================================`);
    console.log(`[UEFI PRODUCTION CORE ONLINE] Systems up and running successfully.`);
    console.log(`[CLIENT CHANNELS MAPPED] Accepting socket inputs on port: ${SERVER_PORT}`);
    console.log(`================================================================\n`);
});
