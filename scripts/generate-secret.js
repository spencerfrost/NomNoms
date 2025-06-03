#!/usr/bin/env node

/**
 * Generate a secure NEXTAUTH_SECRET
 * Run with: node scripts/generate-secret.js
 */

const crypto = require('crypto');

function generateSecureSecret() {
  // Generate 32 random bytes and encode as base64
  const secret = crypto.randomBytes(32).toString('base64');
  
  console.log('🔐 Generated secure NEXTAUTH_SECRET:');
  console.log('');
  console.log(`NEXTAUTH_SECRET=${secret}`);
  console.log('');
  console.log('⚠️  Important:');
  console.log('1. Copy this secret to your .env.local file');
  console.log('2. Never commit this secret to version control');
  console.log('3. Use a different secret for each environment (dev/staging/prod)');
  console.log('4. Store production secrets securely (e.g., in your hosting platform)');
  
  return secret;
}

if (require.main === module) {
  generateSecureSecret();
}

module.exports = { generateSecureSecret };
