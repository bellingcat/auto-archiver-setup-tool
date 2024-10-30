<template>
  <v-container class="pane">
    <v-card :loading="loadingGroups || loadingArchive">
      <v-card-title class="text-center">
        Archive a single URL
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-text-field v-model="url" label="URL" required :rules="[urlValidator]"></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
            <v-radio-group v-model="public" inline>
              <v-radio label="Public" :value="true"></v-radio>
              <v-radio label="Private" :value="false"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="12" md="4">
            <v-select v-show="!public && groupsLoaded" v-model="group" label="Group" :items="availableGroups"
              density="compact" :disabled="!groupsLoaded"></v-select>
          </v-col>
          <v-col cols="12" md="4" class="text-right">
            <v-btn @click="archiveUrl" color="primary" :disabled="!validUrl || loadingGroups || loadingArchive || (!public && group == -1)">
              Archive
            </v-btn>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <p v-if="loadingArchive">
              <v-progress-circular color="primary" indeterminate></v-progress-circular>
              Archive in progress task id = <code>{{ taskId }}</code>
            </p>
            <v-alert color="success" icon="mdi-information" v-if="archiveResult">
              Archived successfully with id {{ taskId }} available <a :href="getUrlFromResult(archiveResult)" target="_blank">here</a>.
            </v-alert>
            <v-alert color="warning" icon="mdi-alert" v-if="archiveFailure">
              Failure: {{archiveFailure}} 
            </v-alert>
            <p v-if="validUrl">
              You can <strong v-if="archiveFailure">still</strong> <router-link :to="`/urls?url=${encodeURIComponent(url)}`"
                target="_blank"><v-icon>mdi-open-in-new</v-icon> search for archives</router-link> of
              this URL.
            </p>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <SnackBar :message="snackbarMessage" :show="snackbar" :color="snackbarColor" @update:show="snackbar = $event" />
  </v-container>
</template>

<script>
import { urlValidator, getUrlFromResult } from "@/utils/misc";
import SnackBar from "@/components/SnackBar.vue";

export default {
  name: "ArchiveUrl",
  components: {
    SnackBar,
  },
  data() {
    return {
      loadingGroups: false,
      groupsLoaded: false,
      availableGroups: [],

      url: "",
      public: true,
      group: -1,
      loadingArchive: false,

      taskId: null,
      archiveResult: null,
      archiveFailure: null,

      snackbar: false,
      snackbarMessage: "",
      snackbarColor: "red",
    };
  },
  computed: {
    urlValidator() {
      return urlValidator;
    },
    getUrlFromResult() {
      return getUrlFromResult;
    },
    validUrl() {
      return this.url && this.urlValidator(this.url) === true;
    },
  },
  watch: {
    public(val) {
      if (!val) this.loadGroups();
    },
    url(val) {
      if (this.validUrl) {
        this.archiveResult = null;
        this.archiveFailure = null;
        this.taskId = null;
      }
    },
  },
  methods: {
    showSnackbar(message, color = "red") {
      this.snackbarMessage = message;
      this.snackbarColor = color;
      this.snackbar = true;
    },
    archiveUrl() {
      if (this.loadingGroups || this.loadingArchive) return;
      this.loadingArchive = true;
      this.archiveResult = null;
      this.archiveFailure = null;

      fetch(`${this.$store.state.API_ENDPOINT}/url/archive`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.$store.state.access_token}`,
        },
        body: JSON.stringify({
          url: this.url,
          group: this.public ? "" : this.group,
          public: this.public,
          tags: [],
        })
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
          }
          return response.json();
        })
        .then(res => {
          console.log("archiveUrl response", res);
          this.taskId = res.id;
          this.showSnackbar(`Your URL is being archived with id ${this.taskId}!`, "green");
          this.pollForArchiveResults();
        })
        .catch(error => {
          console.error("/archive ", error);
          this.showSnackbar(`Unable to archive URL: ${error.message}`);
          this.loadingArchive = false;
        })
    },
    pollForArchiveResults() {
      this.loadingArchive = true;
      const poll = () => {
        fetch(`${this.$store.state.API_ENDPOINT}/task/${this.taskId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.$store.state.access_token}`,
          }
        })
          .then(response => response.json())
          .then(task => {
            if (task.status === "SUCCESS") {
              this.showSnackbar(`URL archived successfully with id ${task.result.id}!`, "green");
              this.loadingArchive = false;
              this.taskId = null;
              this.archiveResult = task;
            } else if (task.status === "FAILURE") {
              this.showSnackbar(`Failed to archive URL: ${task.result.error}`);
              this.loadingArchive = false;
              this.taskId = null;
              this.archiveFailure = task.result.error;
            } else {
              setTimeout(poll, 5000); // Poll every 5 seconds
            }
          })
          .catch(error => {
            console.error("/task ", error);
            this.showSnackbar(`Error checking archive status: ${error.message}`);
            this.loadingArchive = false;
          });
      };
      poll();
    },
    loadGroups() {
      if (this.groupsLoaded) return;
      this.loadingGroups = true;

      fetch(`${this.$store.state.API_ENDPOINT}/groups`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.$store.state.access_token}`,
        }
      })
        .then(response => response.json())
        .then(items => {
          if (!Array.isArray(items)) {
            throw (`Unexpected response format from API`);
          }
          this.availableGroups = [{ title: "only me", value: "" }].concat(items.map(g => ({ title: g, value: g })));
          this.group = this.availableGroups[0].value;
          this.groupsLoaded = true;
        })
        .catch(error => {
          console.error("/groups ", error);
          this.showSnackbar(`Unable to fetch groups: ${error}`);
        })
        .finally(() => {
          this.loadingGroups = false;
        });
    },
  },
};
</script>