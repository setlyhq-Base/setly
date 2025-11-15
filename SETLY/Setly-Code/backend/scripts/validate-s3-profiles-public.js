#!/usr/bin/env node
/*
 Validate S3 bucket policy and public readability for profile snapshots.

 Usage:
   node scripts/validate-s3-profiles-public.js [--check-object profiles/<uid>.json]

 Requires env:
   AWS_REGION, AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
*/
const { S3Client, GetBucketPolicyCommand, GetPublicAccessBlockCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const fetch = require('node-fetch');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { checkObject: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--check-object') out.checkObject = args[++i];
  }
  return out;
}

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

async function main() {
  const { checkObject } = parseArgs();
  const region = requireEnv('AWS_REGION');
  const bucket = requireEnv('AWS_S3_BUCKET');

  const s3 = new S3Client({ region, credentials: { accessKeyId: requireEnv('AWS_ACCESS_KEY_ID'), secretAccessKey: requireEnv('AWS_SECRET_ACCESS_KEY') } });

  let pass = true;
  console.log(`Checking bucket: ${bucket} (${region})`);

  // 1) Bucket policy includes public read for profiles/*
  try {
    const res = await s3.send(new GetBucketPolicyCommand({ Bucket: bucket }));
    const pol = JSON.parse(res.Policy);
    const stmts = Array.isArray(pol.Statement) ? pol.Statement : [pol.Statement];
    const allowsPublicRead = stmts.some(s => {
      const actions = (Array.isArray(s.Action) ? s.Action : [s.Action]).map(String);
      const resources = (Array.isArray(s.Resource) ? s.Resource : [s.Resource]).map(String);
      const principal = s.Principal;
      const anyPrincipal = principal === '*' || (principal && principal.AWS === '*');
      const getAllowed = actions.includes('s3:GetObject') || actions.includes('s3:*') || actions.includes('*');
      const hasProfiles = resources.some(r => /:s3:::.+\/profiles\/*$/.test(r) || /:s3:::.+\/profiles\/.+/.test(r));
      return anyPrincipal && getAllowed && hasProfiles && s.Effect === 'Allow';
    });
    if (allowsPublicRead) {
      console.log('PASS: Bucket policy allows public GET on profiles/*');
    } else {
      pass = false;
      console.log('FAIL: Bucket policy does not allow public GET on profiles/*');
    }
  } catch (e) {
    console.log('WARN: Could not fetch bucket policy (may be absent).', e.message || e);
  }

  // 2) PublicAccessBlock (informational)
  try {
    const pab = await s3.send(new GetPublicAccessBlockCommand({ Bucket: bucket }));
    const cfg = pab.PublicAccessBlockConfiguration || {};
    console.log('Info: PublicAccessBlockConfiguration', cfg);
  } catch (e) {
    console.log('WARN: Could not get PublicAccessBlock (insufficient perms or not set).');
  }

  // 3) Optional object checks
  if (checkObject) {
    const key = checkObject;
    const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    // HEAD with signed client (confirms object exists)
    try {
      await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
      console.log(`PASS: Object exists: s3://${bucket}/${key}`);
    } catch (e) {
      pass = false;
      console.log(`FAIL: Object not accessible via API: s3://${bucket}/${key} (${e.message || e})`);
    }
    // Fetch public URL unauthenticated
    try {
      const r = await fetch(publicUrl, { method: 'GET' });
      if (r.ok) {
        console.log(`PASS: Public GET succeeded: ${publicUrl}`);
      } else {
        pass = false;
        console.log(`FAIL: Public GET failed (${r.status}) for ${publicUrl}`);
      }
    } catch (e) {
      pass = false;
      console.log(`FAIL: Public GET error for ${publicUrl}:`, e.message || e);
    }
  }

  process.exit(pass ? 0 : 1);
}

main().catch(e => {
  console.error('Validation error:', e);
  process.exit(1);
});
