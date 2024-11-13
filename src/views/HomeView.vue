<template>
  <v-container class="pane" fluid  v-if="!user || !user.active" >
    <v-row>
      <v-col>
        <v-alert color="orange" icon="mdi-information" v-if="user && !user.active">
          To use this tool you need a Google account and <strong>permission from the Bellingcat team</strong>.<br />
          You can do so HERE: TODO.
        </v-alert>
        <v-card style="margin-bottom: 1em">
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
              This tool can be used to archive digital content via single URL or Google Sheets, you can also search for archived content.
            </p>
            <p v-if="!user || !user.active">
              To use this tool you need a Google account and <strong>permission from the Bellingcat team</strong>.
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
  <ArchiveSheet v-if="user?.active" />
  <ManageSheets v-if="user?.active" />
</template>

<script>
import ArchiveSheet from "@/components/ArchiveSheet.vue";
import ManageSheets from "@/components/ManageSheets.vue";

export default {
  name: "HomeView",
  components: {
    ArchiveSheet, ManageSheets
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
  }
};
</script>
