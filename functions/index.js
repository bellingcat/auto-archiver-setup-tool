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

initializeApp();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

exports.processSheetScheduler = onSchedule(
  "0,15,30,45 * * * *",
  async (event) => {
    const db = getFirestore();

    // get all documents from firestore sheets collection
    const querySnapshot = await db.collection("sheets").get();

    querySnapshot.forEach(async (doc) => {
      console.log("processing document: ", doc.id);

      // send POST request with sheetID to trigger sheet processing
      const sheetId = doc.data().sheetId;
      const url = "https://auto-archiver-api.bellingcat.com/sheet_service";
      const data = { sheet_id: sheetId };
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Basic " +
            Buffer.from(
              "service:password"
            ).toString("base64"),
        },
        body: JSON.stringify(data),
      };

      const response = await fetch(url, options);
      console.log(response);

      await doc.ref.update({ lastArchived: Date.now() });

      await sleep(1000);
    });
  }
);
