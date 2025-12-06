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
  apiUrl: 'http://localhost:3000/api',
  apiBaseUrl: 'http://localhost:3000/api',
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
    bypassTrustedActions: true
  },
  universityApiBase: 'https://universities.hipolabs.com',
  // Load prebuilt dataset from S3 for fast and reliable autocomplete
  universitiesDataUrl: 'https://setly-s3-bucket.s3.us-east-2.amazonaws.com/universities/us_in_universities.json'
};
