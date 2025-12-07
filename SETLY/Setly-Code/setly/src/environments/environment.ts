export const environment = {
  production: true,
  firebase: {
    // Prod Firebase config (same as dev for now; replace with prod secrets when ready)
    apiKey: "AIzaSyDLk2hmPHVtlBdxu0Rctfh2G5FnAIHpq64",
    authDomain: "setly-fire.firebaseapp.com",
    projectId: "setly-fire",
    storageBucket: "setly-fire.firebasestorage.app",
    messagingSenderId: "577734262579",
    appId: "1:577734262579:web:de22f8e59f43303e1f4846",
    measurementId: "G-NVJEGLQLR3"
  },
  apiUrl: 'https://api.setly.com/v1',
  apiBaseUrl: 'https://api.setly.com/v1',
  analytics: {
    gaMeasurementId: ''
  },
  assistant: {
    apiUrl: 'https://api.setly.com/v1/assistant/chat',
    enabled: true,
    playbooks: ['housing','airport','sim','bank','ssn'],
    maxHistory: 30
  },
  recaptcha: {
    // reCAPTCHA Enterprise site key (prod) – replace with production key if different
    siteKey: '6LfLjgcsAAAAAjs6Y6rPaWmNpekSyGAUD7Qv5tT'
  },
  featureFlags: {
    softDisableAuth: false,
    mockPhoneAuth: false,
    disableRecaptchaEnterprise: false,
    bypassTrustedActions: false,
    // Keep off in prod; use S3 uploads
    forceLocalUploads: false,
    // Allow disabling presence heartbeat if backend under maintenance
    disablePresenceHeartbeat: false,
    // Request debug meta in heartbeat responses (frontend adds ?debug=1)
    presenceDebug: false,
    enableRoomVideo: false,
    enableAmenitySuggestions: true
  },
  universityApiBase: 'https://universities.hipolabs.com',
  // Use S3 dataset for faster, consistent suggestions in production
  universitiesDataUrl: 'https://setly-s3-bucket.s3.us-east-2.amazonaws.com/universities/us_in_universities.json',
  // Google Maps API key for location features
  googleMapsApiKey: 'AIzaSyDLk2hmPHVtlBdxu0Rctfh2G5FnAIHpq64' // Replace with actual Maps API key
};
