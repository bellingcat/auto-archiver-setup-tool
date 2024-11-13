<template>
  <v-container class="pane" fluid v-if="!user || !user.active">
    <v-row>
      <v-col>
        <v-alert color="orange" icon="mdi-information" v-if="user && !user.active" class="text-center" style="font-size:x-large">
            To use this tool you need <strong>permission from Bellingcat's tech team</strong>. You can ask for access via <a href="https://forms.gle/crqBXUtyZcbLhiRQ9" target="_blank">this form</a>.
        </v-alert>
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
