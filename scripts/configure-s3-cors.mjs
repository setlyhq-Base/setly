import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from '@aws-sdk/client-s3';

// S3 CORS configuration for setly-s3-bucket
const bucketName = 'setly-s3-bucket';
const region = 'us-east-2';

// Initialize S3 client
const client = new S3Client({ region });

// CORS configuration that allows localhost origins for development
const corsConfiguration = {
  CORSRules: [
    {
      AllowedHeaders: ['*'],
      AllowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
      AllowedOrigins: [
        'http://localhost:4200',
        'http://localhost:4201',
        'http://localhost:3000',
        'http://localhost:3001',
        'https://setly-app.netlify.app',
        'https://setly.netlify.app',
        'https://*.netlify.app'
      ],
      ExposeHeaders: ['ETag', 'x-amz-meta-*'],
      MaxAgeSeconds: 3000
    }
  ]
};

async function updateCorsConfiguration() {
  try {
    console.log('🔄 Checking current CORS configuration...');
    
    // Get current CORS configuration
    try {
      const getCurrentCors = new GetBucketCorsCommand({ Bucket: bucketName });
      const currentCors = await client.send(getCurrentCors);
      console.log('📋 Current CORS rules:', JSON.stringify(currentCors.CORSRules, null, 2));
    } catch (error) {
      console.log('⚠️ No existing CORS configuration found');
    }
    
    console.log('🔧 Updating CORS configuration...');
    
    // Apply new CORS configuration
    const putCorsCommand = new PutBucketCorsCommand({
      Bucket: bucketName,
      CORSConfiguration: corsConfiguration
    });
    
    await client.send(putCorsCommand);
    
    console.log('✅ CORS configuration updated successfully!');
    console.log('🎯 Allowed origins:');
    corsConfiguration.CORSRules[0].AllowedOrigins.forEach(origin => {
      console.log(`   - ${origin}`);
    });
    
    // Verify the update
    console.log('\n🔍 Verifying updated configuration...');
    const verifyCommand = new GetBucketCorsCommand({ Bucket: bucketName });
    const verifyResult = await client.send(verifyCommand);
    console.log('✅ Verification complete. Updated CORS rules active.');
    
  } catch (error) {
    console.error('❌ Error updating CORS configuration:');
    console.error('Error details:', error.message);
    
    if (error.name === 'NoSuchBucket') {
      console.error('🚨 Bucket not found. Please verify the bucket name and region.');
    } else if (error.name === 'AccessDenied') {
      console.error('🚨 Access denied. Please check your AWS credentials and permissions.');
      console.error('Required permissions: s3:GetBucketCors, s3:PutBucketCors');
    }
    
    process.exit(1);
  }
}

// Run the update
updateCorsConfiguration();