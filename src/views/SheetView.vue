<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card style="margin-bottom: 1em">
          <v-card-text>
            <v-alert color="#f2d97c" icon="mdi-alert">
              This is a pre-release prototype demo service provided on a
              best-effort basis. Do not use for mission critical or sensitive
              data.
            </v-alert>
            <p>
              This tool will configure a Google Sheet on your Google account for
              use with
              <a href="https://github.com/bellingcat/auto-archiver"
                >Bellingcat's Auto Archiver</a
              >. For more information about the Auto Archiver and how to use it,
              see
              <a href="https://github.com/bellingcat/auto-archiver"
                >our Github repository</a
              >
              and the
              <a
                href="https://www.bellingcat.com/resources/2022/09/22/preserve-vital-online-content-with-bellingcats-auto-archiver-tool/"
                >associated article</a
              >.
            </p>
            <h4>How archiving a Google Spreadsheet works</h4>
            <ul>
              <li>Add links to the <code>Link</code> column</li>
              <li>
                Links are archived
                <b>every 60 minutes</b>, or you can trigger a manual archive
                below
              </li>
              <li>
                You can modify and share the Google Sheet subsequently, but do
                not edit the auto archiver column names in the header row or
                remove the service account from the shared users
              </li>
            </ul>
          </v-card-text>
        </v-card>

        <DocList v-if="user" />

        <div class="text-h5 mt-5 mb-3">Manage new auto-archiver sheets</div>

        <v-card style="margin-bottom: 1em">
          <v-card-title>Create a new auto-archiver sheet</v-card-title>
          <v-card-text>
            <ol style="margin-bottom: 1em">
              <li>Press "create" to create a new archiving Google Sheet</li>
              <li>
                This sheet will be shared with the service account necessary for
                Bellingcat's archiving server
              </li>
              <li>The sheet will appear in your list</li>
            </ol>
            <v-text-field
              label="Document name"
              v-model="docName"
              v-if="user"
            ></v-text-field>
            <v-btn
              @click="$store.dispatch('add', { name: docName })"
              :loading="$store.state.loading"
              v-if="user"
              >Create</v-btn
            >
            <v-alert v-if="!user" color="#f2d97c" icon="mdi-alert"
              ><a href="#!" @click="$store.dispatch('signin')"
                >Sign in with a Google account</a
              >
              to continue</v-alert
            >
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-title
            >Enable the auto-archiver in an existing sheet</v-card-title
          >
          <v-card-text>
            <ol style="margin-bottom: 1em">
              <li>
                Invite
                <code
                  >bellingcat-auto-archiver-api@bellingcat-auto-archiver-b85db.iam.gserviceaccount.com</code
                >
                into your spreadsheet
              </li>
              <!-- Link	Archive status	Destination folder	Archive location	Archive date	Thumbnail	Upload timestamp	Upload title	Textual content	Screenshot	Hash -->
              <li>
                Make sure you have the following <b>mandatory</b> column names:
                <ul>
                  <li><code>Link</code> where you will put the URLs.</li>
                  <li>
                    <code>Archive Status</code> to monitor progress and success
                    of archiver
                  </li>
                  <li>
                    <code>Archive location</code> where the link to the archived
                    content is added
                  </li>
                </ul>
              </li>
              <li>
                Add any of the following <b>optional</b> column names:
                <ul>
                  <li>
                    <code>Archive date</code> info on when archiving occurred
                  </li>
                  <li>
                    <code>Thumbnail</code> an image preview from archived media
                  </li>
                  <li>
                    <code>Upload timestamp</code> online content creation date
                  </li>
                  <li><code>Upload title</code> title</li>
                  <li><code>Textual content</code> text content</li>
                  <li><code>Screenshot</code> link to page screenshot</li>
                  <li>
                    <code>Hash</code> content hash (for integrity purposes)
                  </li>
                </ul>
              </li>
              <li>Paste the Google Sheet URL</li>
              <li>Press "enable" to add the Google Sheet to your list</li>
              <li>
                Manually check archiving is working and re-check the steps above
                if it is not
              </li>
            </ol>
            <v-alert
              v-if="$store.state.errorMessage"
              title="Error"
              text
              type="error"
              variant="outlined"
              closable
              >{{ $store.state.errorMessage }}</v-alert
            >
            <v-text-field
              label="Google Sheet URL"
              v-model="spreadsheetUrl"
              :hint="spreadsheetId ? 'Detected id: ' + spreadsheetId : ''"
              persistent-hint
              v-if="user"
            ></v-text-field>
            <v-btn
              @click="$store.dispatch('enable', { spreadsheetId })"
              :loading="$store.state.loading"
              v-if="user"
              >Enable</v-btn
            >
            <v-alert v-if="!user" color="#f2d97c" light icon="mdi-alert"
              ><a href="#!" @click="$store.dispatch('signin')"
                >Sign in with a Google account</a
              >
              to continue</v-alert
            >
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import DocList from "@/components/DocList.vue";

export default {
  name: "HomeView",
  components: {
    DocList,
  },
  data() {
    return {
      docName: "Auto archiver sheet",
      spreadsheetUrl: "",
    };
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
    spreadsheetId() {
      if (
        this.spreadsheetUrl.startsWith("http") &&
        this.spreadsheetUrl.split("/").length >= 6
      ) {
        return this.spreadsheetUrl.split("/")[5];
      }
      return this.spreadsheetUrl;
    },
  },
  methods: {},
};
</script>
