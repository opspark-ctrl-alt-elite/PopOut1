import admin from 'firebase-admin';
// import path from 'path';

// const serviceAccount = require(path.join(__dirname, '../../service-account-key.json'));

const decodedKey = JSON.parse(
  Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY as string, 'base64').toString('utf-8')
);

if (!admin.apps.length) {
  admin.initializeApp({
    // credential: admin.credential.cert(serviceAccount),
    credential: admin.credential.cert(decodedKey),
  });
}

export const messaging = admin.messaging();