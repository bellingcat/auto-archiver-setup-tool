import Vue from "vue";
import Vuex from "vuex";

/* eslint-disable */
// eslint-disable-next-line
import { gapi, client } from "@/gapi";
import {
  signOut,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import {
  collection,
  addDoc,
  query,
  where,
  limit,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { firebaseAuth, firebaseFirestore } from "@/firebase.js";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: null,
    access_token: null,
    docs: [],
    loading: false,
    errorMessage: "",
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    setDocs(state, docs) {
      state.docs = docs;
    },
    setLoading(state, loading) {
      state.loading = loading;
    },
    setAccessToken(state, access_token) {
      state.access_token = access_token;
    },
    setErrorMessage(state, errorMessage) {
      state.errorMessage = errorMessage;
    },
  },
  actions: {
    async signin({ commit, dispatch }) {
      async function callback(tokenResponse) {
        let access_token = tokenResponse.access_token;
        commit("setAccessToken", access_token);
        const credential = GoogleAuthProvider.credential(null, access_token);

        const response = await signInWithCredential(firebaseAuth, credential);

        commit("setUser", response.user);
        dispatch("getDocs");
      }

      commit("setUser", null);

      // eslint-disable-next-line
      const client = google.accounts.oauth2.initTokenClient({
        client_id:
          "406209235111-r1mpkvkfaqc2jg5iqbvffl2b0rf4clbo.apps.googleusercontent.com",
        scope:
          "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
        callback,
      });

      client.requestAccessToken();
    },

    async signout({ commit }) {
      console.log("sign out");
      try {
        await gapi.auth2.getAuthInstance().signOut();
        console.log("User is signed out from gapi.");

        await signOut(firebaseAuth);
        console.log("User is signed out from firebase.");

        // clean user from store
        commit("setUser", null);
        commit("setDocs", []);
      } catch (error) {
        console.error("signOutUser (firebase/auth.js): ", error);
      }
    },

    async getDocs({ state, commit }) {
      try {
        // get documents where uid matches user

        const q = query(
          collection(firebaseFirestore, "sheets"),
          where("uid", "==", state.user.uid)
        );

        const response = await getDocs(q);

        const docs = response.docs.map((d) => ({ id: d.id, ...d.data() }));
        commit("setDocs", docs);
        commit("setLoading", false);
      } catch (error) {
        console.error("getDocs (firebase.js): ", error);
      }
    },

    async removeDoc({ dispatch }, id) {
      try {
        await deleteDoc(doc(firebaseFirestore, "sheets", id));

        dispatch("getDocs");
      } catch (error) {
        console.error("removeDocs (firebase.js): ", error);
      }
    },

    async archive({ state, dispatch }, sheet) {
      try {
        // send a post request to the API with the sheet ID in the body
        // and a bearer auth token in the header
        await fetch(
          "https://auto-archiver-api.bellingcat.com/sheet",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${state.access_token}`,
            },
            body: JSON.stringify({
              sheet_id: sheet.sheetId,
            }),
          }
        );

        // update firestore with the archive status
        const docRef = doc(firebaseFirestore, "sheets", sheet.id);

        await updateDoc(docRef, {
          lastArchived: Date.now(),
        });

        // update the store
        dispatch("getDocs");
      } catch (error) {
        console.error("archive (firebase.js): ", error);
      }
    },

    async add({ state, dispatch, commit }, { name }) {
      commit("setLoading", true);

      try {
        // create new sheet
        const newSheet = await gapi.client.sheets.spreadsheets.create({
          properties: {
            title: name,
          },
        });

        const spreadsheetId = newSheet.result.spreadsheetId;

        const userEnteredFormat = {
          textFormat: {
            bold: true,
          },
        };

        // add header row
        await gapi.client.sheets.spreadsheets.batchUpdate(
          {
            spreadsheetId: spreadsheetId,
          },
          {
            requests: [
              {
                updateCells: {
                  rows: [
                    {
                      values: [
                        {
                          userEnteredValue: {
                            stringValue: "Link",
                          },
                          userEnteredFormat,
                        },
                        {
                          userEnteredValue: {
                            stringValue: "Archive status",
                          },
                          userEnteredFormat,
                        },

                        {
                          userEnteredValue: {
                            stringValue: "Destination folder",
                          },
                          userEnteredFormat,
                        },
                        {
                          userEnteredValue: {
                            stringValue: "Archive location",
                          },
                          userEnteredFormat,
                        },
                        {
                          userEnteredValue: {
                            stringValue: "Archive date",
                          },
                          userEnteredFormat,
                        },
                        {
                          userEnteredValue: {
                            stringValue: "Thumbnail",
                          },
                          userEnteredFormat,
                        },
                        {
                          userEnteredValue: {
                            stringValue: "Upload timestamp",
                          },
                          userEnteredFormat,
                        },
                        {
                          userEnteredValue: {
                            stringValue: "Upload title",
                          },
                          userEnteredFormat,
                        },
                        {
                          userEnteredValue: {
                            stringValue: "Textual content",
                          },
                          userEnteredFormat,
                        },
                        {
                          userEnteredValue: {
                            stringValue: "Screenshot",
                          },
                          userEnteredFormat,
                        },
                        {
                          userEnteredValue: {
                            stringValue: "Hash",
                          },
                          userEnteredFormat,
                        },
                        // {
                        //   userEnteredValue: {
                        //     stringValue: "WACZ",
                        //   },
                        //   userEnteredFormat,
                        // },
                        // {
                        //   userEnteredValue: {
                        //     stringValue: "Replaywebpage",
                        //   },
                        //   userEnteredFormat,
                        // },
                      ],
                    },
                  ],
                  fields:
                    "userEnteredValue.stringValue,userEnteredFormat.textFormat.bold",
                  start: {
                    sheetId: 0,
                    rowIndex: 0,
                    columnIndex: 0,
                  },
                },
              },
              {
                addProtectedRange: {
                  protectedRange: {
                    range: {
                      sheetId: 0,
                      startRowIndex: 0,
                      endRowIndex: 1,
                      startColumnIndex: 0,
                      endColumnIndex: 11,
                    },
                    description:
                      "Protecting header row (needed for auto-archiver), do not modify archiving column names, you can add and move columns around when no 'Archive in Progress' is present in the 'Archive status' column.",
                    warningOnly: true,
                  },
                },
              },
            ],
          }
        );

        // add permissions
        await gapi.client.drive.permissions.create({
          fileId: spreadsheetId,
          resource: {
            role: "writer",
            type: "user",
            emailAddress:
              "bellingcat-auto-archiver-api@bellingcat-auto-archiver-b85db.iam.gserviceaccount.com",
          },
        });

        const col = await collection(firebaseFirestore, "sheets");
        await addDoc(col, {
          sheetId: spreadsheetId,
          url: newSheet.result.spreadsheetUrl,
          timestamp: Date.now(),
          uid: state.user.uid,
          lastArchived: null,
          name: name,
        });

        dispatch("getDocs");
      } catch (error) {
        console.error("add (firebase.js): ", error);
      }
    },

    async enable({ state, dispatch, commit }, { spreadsheetId }) {
      commit("setLoading", true);
      commit("setErrorMessage", "");

      try {
        // fetch existing sheet
        const sheetToEnable = await gapi.client.sheets.spreadsheets.get({
          spreadsheetId: spreadsheetId,
        });

        const q = query(
          collection(firebaseFirestore, "sheets"),
          where("uid", "==", state.user.uid),
          where("sheetId", "==", spreadsheetId),
          limit(1)
        );

        const response = await getDocs(q);
        if(response.docs.length > 0) {
          throw "Sheet already enabled";
        }

        const col = await collection(firebaseFirestore, "sheets");
        await addDoc(col, {
          sheetId: spreadsheetId,
          url: sheetToEnable.result.spreadsheetUrl,
          timestamp: Date.now(),
          uid: state.user.uid,
          lastArchived: null,
          name: sheetToEnable.result.properties.title,
        });

        dispatch("getDocs");
      } catch (error) {
        commit("setErrorMessage", `Unable to add sheet: ${JSON.stringify(error)}`);
        commit("setLoading", false);
        console.error("add (firebase.js): ", error);
      }
    },
  },
});
