"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasFirebaseCreds = exports.db = exports.auth = void 0;
const admin = __importStar(require("firebase-admin"));
const dotenv_1 = __importDefault(require("dotenv"));
// Ensure env vars from .env are loaded before reading them
dotenv_1.default.config();
// Strategy (in order):
// 1) Explicit env vars FIREBASE_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY
// 2) GOOGLE_APPLICATION_CREDENTIALS pointing to a service account JSON file (ADC)
// 3) FIREBASE_SERVICE_ACCOUNT_JSON containing the full JSON string
// If none found, Admin SDK remains disabled.
const hasFirebaseCreds = !!(process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY);
exports.hasFirebaseCreds = hasFirebaseCreds;
const hasADC = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
const hasInlineJSON = !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
let auth = null;
exports.auth = auth;
let db = null;
exports.db = db;
try {
    if (hasFirebaseCreds) {
        const app = admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            })
        });
        exports.auth = auth = app.auth();
        exports.db = db = app.firestore();
        console.log('[Firebase] Admin initialized from FIREBASE_* env vars');
    }
    else if (hasADC) {
        const app = admin.initializeApp({
            credential: admin.credential.applicationDefault()
        });
        exports.auth = auth = app.auth();
        exports.db = db = app.firestore();
        console.log('[Firebase] Admin initialized from GOOGLE_APPLICATION_CREDENTIALS (ADC)');
    }
    else if (hasInlineJSON) {
        const json = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        const app = admin.initializeApp({
            credential: admin.credential.cert(json)
        });
        exports.auth = auth = app.auth();
        exports.db = db = app.firestore();
        console.log('[Firebase] Admin initialized from FIREBASE_SERVICE_ACCOUNT_JSON');
    }
    else {
        console.warn('[Firebase] Admin SDK disabled (no credentials found). Features depending on admin will be unavailable.');
    }
}
catch (e) {
    console.error('[Firebase] Failed to initialize Admin SDK:', e);
}
