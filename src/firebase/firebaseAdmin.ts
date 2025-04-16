import admin from 'firebase-admin';
import path from 'path';

const serviceAccount = require(path.join(__dirname, '../../service-account-key.json'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const messaging = admin.messaging();