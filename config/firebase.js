// // const admin = require('firebase-admin');
// // const serviceAccount = require('./firebase-service-key.json'); // rename downloaded file

// // admin.initializeApp({
// //   credential: admin.credential.cert(serviceAccount),
// // });

// // module.exports = admin;
// 🔧 Requirements
// ✅ 1. Firebase Project Setup
// If not done already:

// Go to https://console.firebase.google.com

// Create a project → Go to “Project Settings” → “Service accounts”

// Click "Generate new private key" → Download firebase-adminsdk.json

// 📦 2. Install Firebase Admin SDK
// bash
// Copy
// Edit
// npm install firebase-admin
// 📂 3. Setup Firebase Admin in Node.js
// File: config/firebase.js

// js
// Copy
// Edit
// const admin = require('firebase-admin');
// const serviceAccount = require('./firebase-service-key.json'); // rename downloaded file

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// module.exports = admin;
// ✅ Place firebase-service-key.json inside your config folder (keep it out of Git)

// 📱 4. Update User Model with FCM Token
// Update models/User.js:

// js
// Copy
// Edit
// fcmToken: { type: String }, // Add this to schema
// 🚀 5. Save Customer FCM Token from Mobile App
// Example API: POST /api/users/fcm-token

// Controller:

// js
// Copy
// Edit
// exports.updateFcmToken = async (req, res) => {
//   try {
//     const { token } = req.body;
//     await User.findByIdAndUpdate(req.user.userId, { fcmToken: token });
//     res.json({ message: 'FCM token updated' });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// };
// Route (userRoutes.js):

// js
// Copy
// Edit
// router.post('/fcm-token', auth(), userController.updateFcmToken);
// 📤 6. Send Notification Function
// File: utils/sendNotification.js

// js
// Copy
// Edit
// const admin = require('../config/firebase');

// const sendNotification = async (fcmToken, title, body, data = {}) => {
//   try {
//     const message = {
//       token: fcmToken,
//       notification: {
//         title,
//         body,
//       },
//       data, // optional custom data
//     };

//     await admin.messaging().send(message);
//     console.log(`✅ FCM notification sent to: ${fcmToken}`);
//   } catch (err) {
//     console.error('FCM Send Error:', err);
//   }
// };

// module.exports = sendNotification;
// 🔔 7. Trigger Notification on JobCard Creation
// In createJobCard controller, after saving:

// js
// Copy
// Edit
// const sendNotification = require('../utils/sendNotification');

// const customer = await User.findById(vehicle.customerId);
// if (customer.fcmToken) {
//   await sendNotification(
//     customer.fcmToken,
//     'Service Job Created',
//     `Your vehicle (${vehicle.registrationNumber}) service has started.`,
//     { jobCardId: jobCard._id.toString() }
//   );
// }
// ✅ You Can Now:
// Save customer’s FCM token from app

// On job card creation or update, send a push notification via FCM

// Extend this for reminders, invoice upload, or job completion

// Would you like to move on to the final step: Dashboard Analytics (service count, revenue etc.)?