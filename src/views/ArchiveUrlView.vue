<template>
  <PermissionNeeded v-if="user && !featureEnabled" feature="Archive URL" />
  <v-container class="pane" v-if="user?.active && featureEnabled">
    <v-card :loading="loadingArchive">
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
            <v-select v-model="group" label="Group" :items="availableGroups" density="compact"></v-select>
          </v-col>
          <v-col cols="12" md="4" class="text-right">
            <v-btn @click="archiveUrl" color="teal"
              :disabled="!validUrl || loadingArchive || (group == 'please select') || maxedOutMBs || maxedOutURLs">
              Archive
            </v-btn>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <p v-if="loadingArchive">
              <v-progress-circular color="teal" indeterminate></v-progress-circular>
              Archive in progress task id = <code>{{ taskId }}</code>
            </p>
            <v-alert color="success" icon="mdi-information" v-if="archiveResult">
              Archived successfully with id {{ taskId }} available <a :href="getUrlFromResult(archiveResult)"
                target="_blank">here</a>.
            </v-alert>
            <v-alert color="warning" icon="mdi-alert" v-if="archiveFailure">
              Failure: {{ archiveFailure }}
            </v-alert>
            <p v-if="validUrl">
              You can <strong v-if="archiveFailure">still</strong> <router-link
                :to="`/archives?url=${encodeURIComponent(url)}`" target="_blank"><v-icon>mdi-open-in-new</v-icon> search
                for
                archives</router-link> of
              this URL.
            </p>
          </v-col>
          <v-col cols="12" sm="12" class="pt-0" v-if="group != 'please select'">
            <span>
              Quota and rules<span v-if="group != ''"> for group <code>{{ group }}</code></span>:
              <ul>
                <li>
                  Monthly URLs: <strong>{{ groupUsage.monthly_urls || 0 }}</strong>
                  out of
                  <strong>{{ displayPermissionValue(groupPermissions?.max_monthly_urls, " URLs") }}</strong>
                  <v-chip v-if="maxedOutURLs" label class="ml-2" color="red" density="comfortable" size="small">maxed
                    out</v-chip>
                </li>
                <li>
                  Monthly MBs:
                  <strong>{{ groupUsage.monthly_mbs || 0 }}</strong>
                  out of
                  <strong>{{ displayPermissionValue(groupPermissions?.max_monthly_mbs, " MBs") }}</strong>
                  <v-chip v-if="maxedOutMBs" label class="ml-2" color="red" density="comfortable" size="small">maxed
                    out</v-chip>
                </li>
                <li>We will store archives for: <strong>{{
                  displayPermissionValue(groupPermissions?.max_archive_lifespan_months, " months") }}</strong>
                </li>
              </ul>
            </span>
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
import PermissionNeeded from "@/components/PermissionNeeded.vue";

export default {
  name: "ArchiveUrlView",
  components: {
    SnackBar, PermissionNeeded
  },
  data() {
    return {
      url: "",
      public: false,
      group: "please select",
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
    user() {
      return this.$store.state.user;
    },
    featureEnabled() {
      return this.user?.permissions?.["all"]?.archive_url;
    },
    urlValidator() {
      return urlValidator;
    },
    getUrlFromResult() {
      return getUrlFromResult;
    },
    validUrl() {
      return this.url && this.urlValidator(this.url) === true;
    },
    availableGroups() {
      const permissions = this.$store.state.user?.permissions || {};
      return Object.keys(permissions)
        .filter(group => group !== "all" && permissions[group].archive_url)
        .map(g => ({ title: g, value: g }));
    },
    globalUsage() {
      return this.$store.state.user?.usage || {};
    },
    groupUsage() {
      if (this.group == "") {
        return this.$store.state.user?.usage || {};
      }
      return this.$store.state.user?.usage?.["groups"]?.[this.group] || {};
    },
    groupPermissions() {
      if (this.group == "") {
        return this.$store.state.user?.permissions?.["all"] || {};
      }
      return this.$store.state.user?.permissions?.[this.group] || {};
    },
    maxedOutMBs() {
      if (this.groupPermissions.max_monthly_mbs === -1) return false;
      return this.groupUsage.monthly_mbs >= this.groupPermissions.max_monthly_mbs;
    },
    maxedOutURLs() {
      if (this.groupPermissions.max_monthly_urls === -1) return false;
      return this.groupUsage.monthly_urls >= this.groupPermissions.max_monthly_urls;
    },
  },
  watch: {
    url(val) {
      this.archiveResult = null;
      this.archiveFailure = null;
      this.taskId = null;
    },
  },
  methods: {
    showSnackbar(message, color = "red") {
      this.snackbarMessage = message;
      this.snackbarColor = color;
      this.snackbar = true;
    },
    archiveUrl() {
      if (this.loadingArchive) return;
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
          group_id: this.group,
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
          this.taskId = res.id;
          this.showSnackbar(`Your URL is being archived with id ${this.taskId}!`, "green");
          this.pollForArchiveResults();
        })
        .catch(error => {
          console.error("/archive ", error);
          this.showSnackbar(`Unable to archive URL: ${error.message}`);
        }).finally(() => {
          this.loadingArchive = false;
        });
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
    displayPermissionValue(value, extraWord) {
      if (value === undefined) { return "not set"; }
      return value == -1 ? "no limit" : value + extraWord;
    }
  },
};
</script>