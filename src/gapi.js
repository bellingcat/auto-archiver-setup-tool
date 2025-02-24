import { gapi } from "gapi-script";

gapi.load("client:auth2", async () => {
  gapi.client.init({
    apiKey: "AIzaSyBEawXAq9pajlVKQtLopWyd_ELDwoUlbDo",
    clientId:
      "406209235111-r1mpkvkfaqc2jg5iqbvffl2b0rf4clbo.apps.googleusercontent.com",
    scope: "https://www.googleapis.com/auth/drive.file",
    discoveryDocs: [
      "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
      "https://sheets.googleapis.com/$discovery/rest?version=v4",
    ],
  });

  gapi.client.load("drive", "v3", () => {});
  gapi.client.load("sheets", "v4", () => {});
});

export { gapi };
