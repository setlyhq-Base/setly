// Environment configuration helper for Angular
// This allows using Amplify environment variables at build time

declare const process: any;

function getApiUrl(): string {
  // Check if we have a build-time environment variable from Amplify
  const amplifyApiUrl = typeof process !== 'undefined' && process.env ? process.env['NG_API_URL'] : null;
  
  if (amplifyApiUrl) {
    return amplifyApiUrl;
  }
  
  // Fallback to relative paths (works with proxy in dev, or Amplify redirects in prod)
  return '/api';
}

export const runtimeEnvironment = {
  apiUrl: getApiUrl()
};
