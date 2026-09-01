const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

(async () => {
  const account = await nodemailer.createTestAccount();
  const env = [
    'PORT=3000',
    `SESSION_SECRET=AJB_${crypto.randomBytes(24).toString('hex')}`,
    'ADMIN_EMAIL=admin@ajbimports.com',
    `ADMIN_PASSWORD_HASH=${bcrypt.hashSync('ChangeMe123!', 12)}`,
    `SMTP_HOST=${account.smtp.host}`,
    `SMTP_PORT=${account.smtp.port}`,
    `SMTP_USER=${account.user}`,
    `SMTP_PASS=${account.pass}`,
    'GOOGLE_SHEET_ID=https://docs.google.com/spreadsheets/d/1JO6Qhr83CIOrO5Ps25EVgJiW-A6pislD/edit?gid=158840977#gid=158840977',
    'GOOGLE_SHEET_TAB=Quote Submissions',
    'GOOGLE_SERVICE_ACCOUNT_JSON=',
    'GOOGLE_DATA_DIR=./data',
    'NODE_ENV=development'
  ].join('\n') + '\n';

  fs.writeFileSync(path.join(process.cwd(), '.env'), env, 'utf8');
  console.log('ENV_UPDATED');
  console.log(env);
})().catch((error) => {
  console.error('ENV_GENERATION_FAILED');
  console.error(error);
  process.exit(1);
});
