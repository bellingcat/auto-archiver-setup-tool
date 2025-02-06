<template>
  <PermissionNeeded v-if="user && !featureEnabled" feature="Archive Spreadsheets" />
  <v-container class="pane" fluid v-if="!user || !user.active">
    <v-row>
      <v-col>
        <v-card>
          <v-card-text>
            <v-card-title class="text-center">
              Welcome to the Auto Archiver Setup Tool
            </v-card-title>
            <v-alert color="#f2d97c" icon="mdi-alert">
              This is a prototype demo service provided on a
              best-effort basis. <br />Do not use for mission critical or sensitive
              data.
            </v-alert>
            <p>
              This tool can be used to archive digital content via single URL or Google Sheets, you can also search for
              archived content.
            </p>
            <div class="text-center">
              <v-btn v-if="!user" @click="$store.dispatch('signin')" size="large">Sign In</v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
  <ArchiveSheet v-if="user?.active && featureEnabled" />
  <ManageSheets v-if="user?.active && featureEnabled" />
</template>

<script>
import ArchiveSheet from "@/components/ArchiveSheet.vue";
import ManageSheets from "@/components/ManageSheets.vue";
import PermissionNeeded from "@/components/PermissionNeeded.vue";

export default {
  name: "HomeView",
  components: {
    ArchiveSheet, ManageSheets, PermissionNeeded
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
    featureEnabled() {
      return this.user?.permissions?.["all"]?.archive_sheet;
    }
  }
};
</script>
