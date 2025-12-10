import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: process.env.AWS_REGION || 'us-east-1' });

class SecretsService {
  private cache: Map<string, { value: any; expiry: number }> = new Map();
  private cacheDuration = 5 * 60 * 1000; // 5 minutes

  async getSecret(secretName: string): Promise<any> {
    // Check cache first
    const cached = this.cache.get(secretName);
    if (cached && cached.expiry > Date.now()) {
      return cached.value;
    }

    try {
      const command = new GetSecretValueCommand({
        SecretId: `setly/${process.env.STAGE}/${secretName}`
      });

      const response = await client.send(command);
      const value = response.SecretString ? JSON.parse(response.SecretString) : null;

      // Cache the value
      this.cache.set(secretName, {
        value,
        expiry: Date.now() + this.cacheDuration
      });

      return value;
    } catch (error) {
      console.error(`Error fetching secret ${secretName}:`, error);
      throw new Error(`Failed to fetch secret: ${secretName}`);
    }
  }

  async getGoogleMapsApiKey(): Promise<string> {
    const secret = await this.getSecret('google-maps-api-key');
    return secret.apiKey;
  }

  async getTicketmasterApiKey(): Promise<string> {
    const secret = await this.getSecret('ticketmaster-api-key');
    return secret.apiKey;
  }

  async getEventbriteApiKey(): Promise<string> {
    const secret = await this.getSecret('eventbrite-api-key');
    return secret.apiKey;
  }

  async getAllApiKeys(): Promise<{
    googleMaps: string;
    ticketmaster: string;
    eventbrite: string;
  }> {
    const [googleMaps, ticketmaster, eventbrite] = await Promise.all([
      this.getGoogleMapsApiKey(),
      this.getTicketmasterApiKey(),
      this.getEventbriteApiKey()
    ]);

    return { googleMaps, ticketmaster, eventbrite };
  }
}

export const secretsService = new SecretsService();
