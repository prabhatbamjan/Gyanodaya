const admin = require('firebase-admin');
const serviceAccount = require('../config/firebaseServiceAccount.json'); // update path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'your-project-id.appspot.com' // replace with your bucket name
});

const bucket = admin.storage().bucket();
module.exports = bucket;
