<template>
  <PermissionNeeded v-if="user && !featureEnabled" feature="Archive Spreadsheets" />
  <WelcomeCard/>
  <ArchiveSheet v-if="user?.active && featureEnabled" />
  <ManageSheets v-if="user?.active && featureEnabled" />
</template>

<script>
import ArchiveSheet from "@/components/ArchiveSheet.vue";
import ManageSheets from "@/components/ManageSheets.vue";
import PermissionNeeded from "@/components/PermissionNeeded.vue";
import WelcomeCard from "@/components/WelcomeCard.vue";

export default {
  name: "HomeView",
  components: {
    ArchiveSheet, ManageSheets, PermissionNeeded, WelcomeCard
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
