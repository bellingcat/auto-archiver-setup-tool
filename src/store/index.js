import { createStore } from "vuex";
import { gapi } from "@/gapi";
import {
  signOut,
  GoogleAuthProvider,
  signInWithCredential,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";
import { firebaseAuth } from "@/firebase.js";

function saveToLocalStorage(state) {
  localStorage.setItem("user", JSON.stringify(state.user));
  localStorage.setItem("access_token", state.access_token);
}

function loadFromLocalStorage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const access_token = localStorage.getItem("access_token");
  return { user, access_token };
}

function clearLocalStorage() {
  localStorage.removeItem("user");
  localStorage.removeItem("access_token");
}

async function waitForGapiAuth2() {
  return new Promise((resolve, _reject) => {
    const checkGapiAuth2 = () => {
      if (gapi.auth2 && gapi.auth2.getAuthInstance()) {
        resolve(gapi.auth2.getAuthInstance());
      } else {
        setTimeout(checkGapiAuth2, 100);
      }
    };
    checkGapiAuth2();
  });
}

export default createStore({
  state: {
    user: null,
    active: false,
    access_token: null,
    sheets: [],
    loadingUserState: false,
    errorMessage: "",
    // API_ENDPOINT: "https://auto-archiver-api.bellingcat.com"
    API_ENDPOINT: process.env.VUE_APP_API_ENDPOINT || "http://localhost:8004",
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
      saveToLocalStorage(state);
    },
    setUserActiveState(state, active) {
      state.user.active = active;
      saveToLocalStorage(state);
    },
    setUserPermissions(state, permissions) {
      state.user.permissions = permissions;
      state.user.groups = Object.keys(permissions).filter(
        (key) => key !== "all"
      );
      state.loadingUserState = false;
      saveToLocalStorage(state);
    },
    setUserUsage(state, usage) {
      state.user.usage = usage;
    },
    setSheets(state, sheets) {
      state.sheets = sheets;
    },
    setLoadingUserState(state, loadingUserState) {
      state.loadingUserState = loadingUserState;
      saveToLocalStorage(state);
    },
    setAccessToken(state, access_token) {
      state.access_token = access_token;
      saveToLocalStorage(state);
    },
    setErrorMessage(state, errorMessage) {
      state.errorMessage = errorMessage;
    },
  },
  actions: {
    async signin({ commit, dispatch }) {
      commit("setLoadingUserState", true);
      async function callback(tokenResponse) {
        let access_token = tokenResponse.access_token;
        commit("setAccessToken", access_token);
        const credential = GoogleAuthProvider.credential(null, access_token);

        // Set persistence before signing in
        await setPersistence(firebaseAuth, browserLocalPersistence);

        // Sign in with the provided credential
        const response = await signInWithCredential(firebaseAuth, credential);

        commit("setUser", response.user);
        dispatch("checkActiveUser");
        dispatch("checkUserPermissions");
        dispatch("checkUserUsage");
      }

      commit("setUser", null);

      const client = google.accounts.oauth2.initTokenClient({
        client_id:
          "406209235111-r1mpkvkfaqc2jg5iqbvffl2b0rf4clbo.apps.googleusercontent.com",
        scope:
          "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
        callback,
      });

      await client.requestAccessToken();
    },

    async signout({ commit }) {
      try {
        const authInstance = await waitForGapiAuth2();
        if (authInstance) {
          await authInstance.signOut();
          console.log("User is signed out from gapi.");
        } else {
          console.warn("gapi.auth2 is not initialized.");
        }

        await signOut(firebaseAuth);
        console.log("User is signed out from firebase.");

        // clean user from store and local storage
        commit("setUser", null);
        commit("setSheets", []);
        clearLocalStorage();
      } catch (error) {
        console.error("signOutUser (firebase/auth.js): ", error);
      } finally {
        commit("setLoadingUserState", false);
      }
    },

    async checkActiveUser({ state, dispatch, commit }) {
      try {
        commit("setErrorMessage", "");
        console.log(`${state.API_ENDPOINT}/user/active`);
        const r = await fetch(`${state.API_ENDPOINT}/user/active`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${state.access_token}`,
          },
        });
        const response = await r.json();
        commit("setUserActiveState", response.active);
        if (response.active === true) {
          dispatch("getSheets");
        }
      } catch (error) {
        console.error("checkActiveUser (firebase.js): ", error);
        commit(
          "setErrorMessage",
          "Unable to check user status against the API"
        );
      }
    },

    async checkUserPermissions({ state, commit }) {
      try {
        commit("setErrorMessage", "");
        const r = await fetch(`${state.API_ENDPOINT}/user/permissions`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${state.access_token}`,
          },
        });
        const response = await r.json();
        commit("setUserPermissions", response);
      } catch (error) {
        console.error("checkUserPermissions (firebase.js): ", error);
        commit(
          "setErrorMessage",
          "Unable to fetch user permissions from the API"
        );
      }
    },
    async checkUserUsage({ state, commit }) {
      try {
        commit("setErrorMessage", "");
        const r = await fetch(`${state.API_ENDPOINT}/user/usage`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${state.access_token}`,
          },
        });
        const response = await r.json();
        commit("setUserUsage", response);
      } catch (error) {
        console.error("checkUserUsage (firebase.js): ", error);
        commit(
          "setErrorMessage",
          "Unable to fetch user usage quota from the API"
        );
      }
    },

    async getSheets({ state, commit }) {
      try {
        commit("setErrorMessage", "");
        if (state.user?.active === false) return;

        fetch(`${state.API_ENDPOINT}/sheet/mine`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${state.access_token}`,
          },
        }).then(async (response) => {
          const res = await response.json();
          if (response.status === 200) {
            commit("setSheets", res);
          } else {
            throw new Error(JSON.stringify(res));
          }
        });
      } catch (error) {
        console.error("getSheets (firebase.js): ", error);
      }
    },
    async createSheet(
      { _state, dispatch, _commit },
      { name, service_account_email }
    ) {
      return new Promise(async (resolve, reject) => {
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
          // TODO: make sure this emailAdress is used according to the group
          await gapi.client.drive.permissions.create({
            fileId: spreadsheetId,
            resource: {
              role: "writer",
              type: "user",
              emailAddress: service_account_email,
            },
          });

          resolve({ success: true, result: spreadsheetId });
        } catch (error) {
          console.error("add (firebase.js): ", error);
          if (error.status === 401) {
            await dispatch("signout");
          }
          reject({ success: false, result: error });
        }
      });
    },
  },
  getters: {
    isTokenExpired: async (state) => {
      if (!state.access_token) return true;
      try {
        const response = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?access_token=${state.access_token}`
        );
        if (response.status !== 200) return true;
        const data = await response.json();
        if (data.expires_in > 0) return false;
      } catch (error) {
        console.error("Error checking token expiration:", error);
        return true;
      }
    },
  },
  modules: {},
  plugins: [
    (store) => {
      store.subscribe((mutation, state) => {
        if (mutation.type === "setUser" || mutation.type === "setAccessToken") {
          saveToLocalStorage(state);
        }
      });

      const { user, access_token } = loadFromLocalStorage();
      if (user && access_token) {
        store.commit("setLoadingUserState", true);
        store.commit("setUser", user);
        store.commit("setAccessToken", access_token);
        store.getters.isTokenExpired
          .then((expired) => {
            if (expired) {
              store.dispatch("signout");
            } else {
              store.dispatch("checkActiveUser");
              store.dispatch("checkUserPermissions");
              store.dispatch("checkUserUsage");
            }
          })
          .catch((error) => {
            console.error("Error checking token expiration:", error);
            store.dispatch("signout");
          });
      }
    },
  ],
});
