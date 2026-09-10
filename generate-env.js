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
    'ADMIN_EMAIL=aljaybeck@gmail.com',
    `ADMIN_PASSWORD_HASH=${bcrypt.hashSync('AJBadmin@19', 12)}`,
    `SMTP_HOST=${account.smtp.host}`,
    `SMTP_PORT=${account.smtp.port}`,
    `SMTP_USER=${account.user}`,
    `SMTP_PASS=${account.pass}`,
    'DATA_DIR=./data',
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
