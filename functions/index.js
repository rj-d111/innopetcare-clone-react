const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.getLastLogin = functions.https.onCall(async (data, context) => {
  const {uid} = data;  // Remove spaces here
  try {
    const userRecord = await admin.auth().getUser(uid);
    return {lastLoginAt: userRecord.metadata.lastSignInTime};  // Remove spaces here
  } catch (error) {
    console.error("Error fetching last login:", error);
    return {lastLoginAt: null};  // Remove spaces here
  }
});
