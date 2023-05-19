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
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { firebaseAuth, firebaseFirestore } from "@/firebase.js";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: null,
    docs: [],
    loading: false,
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
  },
  actions: {
    async signin({ commit, dispatch }) {
      async function callback(tokenResponse) {
        let access_token = tokenResponse.access_token;
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
        scope: "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile",
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
                        {
                          userEnteredValue: {
                            stringValue: "WACZ",
                          },
                          userEnteredFormat,
                        },
                        {
                          userEnteredValue: {
                            stringValue: "Replaywebpage",
                          },
                          userEnteredFormat,
                        },
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
                      endColumnIndex: 13,
                    },
                    description:
                      "Protecting header row (needed for auto-archiver)",
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
              "test-auto-archiver@bc-auto-archiver.iam.gserviceaccount.com",
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
  },
});
