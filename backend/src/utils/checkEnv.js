const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_ANON_KEY',
  'GEMINI_API_KEY'
];

const missing = requiredEnvVars.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error('\n================================================================');
  console.error('❌ CRITICAL ERROR: MISSING REQUIRED ENVIRONMENT VARIABLES!');
  console.error('================================================================');
  missing.forEach(key => {
    console.error(`👉 process.env.${key} is not defined.`);
  });
  console.error('\n💡 Troubleshooting:');
  console.error('1. If deploying locally, copy .env.example to .env and fill in the values.');
  console.error('2. If deploying to Railway, add these variables in your service settings under the "Variables" tab.');
  console.error('================================================================\n');
  process.exit(1);
}
