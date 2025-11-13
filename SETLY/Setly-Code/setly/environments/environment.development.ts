export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000/api',
  stripePublicKey: 'pk_test_...',
  storageBucket: 'setly-dev.appspot.com',
  assistant: {
    // Allow using base; runtime will append /chat if missing
    apiUrl: 'http://localhost:3000/api/assistant'
  },
  firebase: {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
  }
};
