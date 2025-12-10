import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: process.env.AWS_REGION || 'us-east-1' });

// Cache for secrets to avoid repeated API calls
const secretsCache: Record<string, string> = {};

/**
 * Get secret from AWS Secrets Manager with caching
 */
export async function getSecret(secretName: string): Promise<string> {
  // TEMP: Cache disabled to allow secret updates
  // if (secretsCache[secretName]) {
  //   return secretsCache[secretName];
  // }

  try {
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const response = await client.send(command);
    
    const secretValue = response.SecretString;
    if (!secretValue) {
      throw new Error(`Secret ${secretName} has no value`);
    }

    console.log(`Fetched secret ${secretName}: ${secretValue.substring(0, 20)}...`);
    
    // Cache the secret
    secretsCache[secretName] = secretValue;
    return secretValue;
  } catch (error) {
    console.error(`Error fetching secret ${secretName}:`, error);
    throw error;
  }
}

/**
 * Get MongoDB URI from Secrets Manager or environment variable
 */
export async function getMongoDBUri(): Promise<string> {
  // Check environment variable first (for local development)
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }

  // Fetch from Secrets Manager (for production)
  const stage = process.env.STAGE || 'dev';
  const secretName = `setly/${stage}/mongodb-uri`;
  return await getSecret(secretName);
}

/**
 * Get Google Maps API key from Secrets Manager or environment variable
 */
export async function getGoogleMapsApiKey(): Promise<string | undefined> {
  // Check environment variable first
  if (process.env.GOOGLE_MAPS_API_KEY) {
    return process.env.GOOGLE_MAPS_API_KEY;
  }

  // Fetch from Secrets Manager
  try {
    const stage = process.env.STAGE || 'dev';
    const secretName = `setly/${stage}/google-maps-api-key`;
    return await getSecret(secretName);
  } catch (error) {
    console.warn('Google Maps API key not found in Secrets Manager');
    return undefined;
  }
}
