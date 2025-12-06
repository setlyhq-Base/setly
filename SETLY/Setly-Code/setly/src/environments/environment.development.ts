export const environment = {
  production: false,
  firebase: {
    // Dev Firebase config (provided)
    apiKey: "AIzaSyDLk2hmPHVtlBdxu0Rctfh2G5FnAIHpq64",
    authDomain: "setly-fire.firebaseapp.com",
    projectId: "setly-fire",
    storageBucket: "setly-fire.firebasestorage.app",
    messagingSenderId: "577734262579",
    appId: "1:577734262579:web:de22f8e59f43303e1f4846",
    measurementId: "G-NVJEGLQLR3"
  },
  // Dev API: use proxy to :3000 backend; keep relative paths to avoid port mismatch
  apiUrl: '/api',
  apiBaseUrl: '/api',
  analytics: {
    gaMeasurementId: ''
  },
  assistant: {
    // Direct to backend in dev (backend has permissive CORS)
    // Services will append /chat if missing
    apiUrl: 'http://localhost:3000/api/assistant',
    enabled: true,
    playbooks: ['housing','airport','sim','bank','ssn'],
    maxHistory: 30
  },
  recaptcha: {
    // reCAPTCHA Enterprise site key (web) – used for phone auth hardening & future abuse signals
    siteKey: '6LfLjgcsAAAAAjs6Y6rPaWmNpekSyGAUD7Qv5tT'
  },
  featureFlags: {
    softDisableAuth: false,
    mockPhoneAuth: true,
    disableRecaptchaEnterprise: true,
    bypassTrustedActions: true,
    // Force local uploads in dev by default; set to false ONLY if testing real S3 with proper CORS
    forceLocalUploads: true,
    // Toggle to silence heartbeat noise when diagnosing auth or presence
    disablePresenceHeartbeat: false,
    // Enable debug meta for presence heartbeat responses
    presenceDebug: true,
    // Explicit override to allow S3 in dev (takes precedence over forceLocalUploads)
    enableS3Dev: false,
    enableRoomVideo: false,
    enableAmenitySuggestions: true
  },
  universityApiBase: 'https://universities.hipolabs.com',
  // Load prebuilt dataset from S3 for fast and reliable autocomplete
  universitiesDataUrl: 'https://setly-s3-bucket.s3.us-east-2.amazonaws.com/universities/us_in_universities.json'
};
