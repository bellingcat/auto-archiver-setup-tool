/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onSchedule } = require("firebase-functions/v2/scheduler");
const logger = require("firebase-functions/logger");

// The Firebase Admin SDK to access Firestore.
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const { defineSecret } = require('firebase-functions/params');
const API_TOKEN = defineSecret('API_SERVICE_PASSWORD');
const CLIENT_EMAIL = defineSecret('GOOGLE_API_CLIENT_EMAIL');
const PRIVATE_KEY = defineSecret('GOOGLE_API_PRIVATE_KEY');

const { google } = require('googleapis');

initializeApp();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

String.prototype.hashCode = function () {
  // https://stackoverflow.com/a/7616484/6196010
  // Generating 1M random strings and applying this function shows it's very balanced for modulo 60
  // 0 has double frequency of other numbers, but that's not a problem
  var hash = 0,
    i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

//TODO: disable the scheduler
exports.processSheetScheduler = onSchedule(
  { secrets: [API_TOKEN, CLIENT_EMAIL, PRIVATE_KEY], schedule: "* * * * *" },
  async (event) => {
    // authenticate the service account
    const googleAuth = new google.auth.JWT(CLIENT_EMAIL.value(), null, PRIVATE_KEY.value().replace(/\\n/g, '\n'), 'https://www.googleapis.com/auth/spreadsheets');
    const sheets = await google.sheets({ version: 'v4', auth: googleAuth });

    // get all documents from firestore sheets collection
    const db = getFirestore();

    // each sheet runs once per hour, so we hash the sheet id and only process it if the hash % 60 matches the cron minute
    const querySnapshot = await db.collection("sheets").get();
    const eventDate = new Date(Date.parse(event.scheduleTime));
    querySnapshot.forEach(async (doc) => {
      const hashToSixty = Math.abs(doc.id.hashCode() % 60);
      if (hashToSixty != eventDate.getMinutes()) {
        return;
      }
      logger.log(`processing document ${doc.id}, its hash % 60 (${hashToSixty}) matches the cron minute (${eventDate.getMinutes()})`);

      try {
        await sheets.spreadsheets.get({ spreadsheetId: doc.data().sheetId });
      } catch (e) {
        if (e.status == 404) {
          await doc.ref.delete();
          logger.log(`document ${doc.data().sheetId} not found, deleted`);
          return;
        }
      }

      // send POST request with sheetID to trigger sheet processing
      const url = "https://auto-archiver-api.bellingcat.com/sheet_service";
      const data = {
        sheet_id: doc.data().sheetId,
        author_id: doc.data().email ?? doc.data().uid,
        tags: ["setup-tool"]
      };
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_TOKEN.value()}`,
        },
        body: JSON.stringify(data),
      };

      const response = await fetch(url, options);

      await doc.ref.update({ lastArchived: Date.now() });

      await sleep(100);
    });
  }
);
