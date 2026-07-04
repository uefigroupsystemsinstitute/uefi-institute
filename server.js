const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();

// --- GLOBAL MIDDLEWARE CONFIGURATIONS ---
app.use(express.json());
app.use(cors()); // Permits secure data exchange between your HTML UI frontend and this server layer

// --- STATE ARCHITECTURE VOLUMES (Simulating Database Storage) ---
const userRegistry = {};       // Retains user accounts, validation stats, and lockout timers
const globalEcosystemFeed = []; // Retains all synced discussion threads, articles, and video assets

// --- SECURITY PROTOCOLS ---
/**
 * Generates an unpredictable, highly complex case-sensitive alphanumeric token
 * Incorporates numbers, uppercase, and lowercase values dynamically.
 */
function generateSecureAlphanumericToken(length = 6) {
    const characterPool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    const secureBytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
        token += characterPool[secureBytes[i] % characterPool.length];
    }
    return token;
}

// --- CORE API ROUTING ENGINE ---

/**
 * 1. IDENTITY REGISTRATION ROUTE
 * Handles new profile creation, signs terms, and returns a secure token to the backend terminal log
 */
app.post('/api/auth/signup', (req, res) => {
    const { email, name, role, password } = req.body;

    if (!email || !name || !role || !password) {
        return res.status(400).json({ 
            success: false, 
            message: "Initialization failure: All registration parameters are mandatory." 
        });
    }

    const accountIdentifier = email.toLowerCase().trim();

    if (userRegistry[accountIdentifier]) {
        return res.status(400).json({ 
            success: false, 
            message: "Registration failure: A profile already exists under this email path." 
        });
    }

    // Provision complex security token configurations
    const dispatchToken = generateSecureAlphanumericToken(6);
    
    userRegistry[accountIdentifier] = {
        name,
        email: accountIdentifier,
        role,
        password, // In a standard live environment, hash this securely utilizing the 'bcrypt' framework
        isVerified: false,
        verificationToken: dispatchToken,
        failedAttempts: 0,
        isLocked: false,
        lockoutUntil: null
    };

    // CONSOLE SIMULATION OUTLET: Captures token presentation layout safely for development
    console.log(`\n======================================================`);
    console.log(`[UEFI IDENTITY ENGAGEMENT DETECTED]: ${accountIdentifier}`);
    console.log(`[VERIFICATION TOKEN ENCLOSED]: ${dispatchToken}  (STRICT CASE-SENSITIVE)`);
    console.log(`======================================================\n`);

    res.status(201).json({
        success: true,
        message: "Ecosystem enrollment successful. Verification token dispatched to backend console parameters.",
        email: accountIdentifier
    });
});

/**
 * 2. IDENTITY CONFIRMATION & BRUTE-FORCE COUNTERMEASURES
 * Implements strict string layout validation and exact lockout limits after 5 missed validation runs.
 */
app.post('/api/auth/verify', (req, res) => {
    const { email, token } = req.body;
    
    if (!email || !token) {
        return res.status(400).json({ success: false, message: "Missing matching target attributes." });
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
                message: `Security Access Restriction: Account locked. Remaining cooling window: ${structuralRemainingWait} minute(s).`
            });
        } else {
            // Restore capabilities post-cooling threshold expiration
            targetProfile.isLocked = false;
            targetProfile.failedAttempts = 0;
        }
    }

    // CRITICAL SECURITY RULE: Explicit Case-Sensitive Layout Evaluation
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
        // Log calculation mistake parameters
        targetProfile.failedAttempts += 1;
        const remainingChances = 5 - targetProfile.failedAttempts;

        if (targetProfile.failedAttempts >= 5) {
            targetProfile.isLocked = true;
            targetProfile.lockoutUntil = Date.now() + (15 * 60 * 1000); // 15-Minute System Lockdown Block
            return res.status(423).json({
                success: false,
                message: "Security breach alert: 5 failed token match events registered. Profile locked for 15 minutes."
            });
        }

        return res.status(400).json({
            success: false,
            message: `Verification code string structure error. Letters and symbols must match structural rules exactly. Case-sensitive!`,
            attemptsRemaining: remainingChances
        });
    }
});

/**
 * 3. TOKEN RE-DISPATCH ARCHITECTURE
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
    targetProfile.failedAttempts = 0; // Wipe attempt index history clean for newly mapped block tracking

    console.log(`\n======================================================`);
    console.log(`[TOKEN RE-DISPATCHED FOR]: ${accountIdentifier}`);
    console.log(`[REFRESHED TOKEN VALUE]: ${secondaryToken}`);
    console.log(`======================================================\n`);

    res.status(200).json({ success: true, message: "A fresh alphanumeric validation layout has been sent." });
});

/**
 * 4. STANDARD ACCOUNT ENTRY POINT
 */
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Missing required credential inputs." });
    }

    const accountIdentifier = email.toLowerCase().trim();
    const targetProfile = userRegistry[accountIdentifier];

    if (!targetProfile || targetProfile.password !== password) {
        return res.status(401).json({ success: false, message: "Access rejected: Invalid entry parameters." });
    }

    if (!targetProfile.isVerified) {
        return res.status(403).json({ 
            success: false, 
            message: "Verification pending: Complete identity confirmation requirements first.", 
            requiresVerification: true 
        });
    }

    res.status(200).json({
        success: true,
        message: "Credentials valid. Loading workspace configurations...",
        name: targetProfile.name,
        role: targetProfile.role
    });
});

/**
 * 5. UEFI ENGAGE / CONNECT: PUBLISH CONTENT PIPELINE
 * Persists user assignments, text strings, diagram references, and uploaded video configurations.
 */
app.post('/api/connect/posts', (req, res) => {
    const { authorEmail, authorName, textContent, videoUrl } = req.body;

    if (!authorEmail || !textContent) {
        return res.status(400).json({ success: false, message: "Unable to process incomplete transmission variables." });
    }

    const compiledPostObject = {
        id: crypto.randomUUID(),
        authorEmail: authorEmail.toLowerCase().trim(),
        authorName: authorName || "UEFI Academic Partner",
        textContent: textContent,
        videoUrl: videoUrl || null, // Handles direct storage links to video elements without asset decay
        timestamp: new Date().toISOString()
    };

    globalEcosystemFeed.unshift(compiledPostObject); // Enforces new material delivery to the apex of the payload feed
    
    res.status(201).json({ 
        success: true, 
        message: "Academic asset securely stored in global network hub registry.", 
        post: compiledPostObject 
    });
});

/**
 * 6. UEFI ENGAGE / CONNECT: DELIVER MULTI-CHANNEL INDEX
 * Transmits data pools dynamically to ensure all participants observe mutual dashboard problems.
 */
app.get('/api/connect/posts', (req, res) => {
    res.status(200).json({ success: true, feed: globalEcosystemFeed });
});

// --- EXECUTION CONTROL CONTROLLER ---
const SERVER_PORT = process.env.PORT || 5000;
app.listen(SERVER_PORT, () => {
    console.log(`[UEFI PRODUCTION CORE ONLINE] Active socket communications mapped to channel port: ${SERVER_PORT}`);
});
