<template>
  <v-app-bar style="flex-grow: 0" class="text-no-wrap">
    <v-toolbar-title>
      <router-link to="/" class="nodecoration">
        Bellingcat Auto Archiver demo
      </router-link>
    </v-toolbar-title>
    <v-btn v-if="!user" @click="$store.dispatch('signin')">Sign In</v-btn>

    <span class="user" v-if="user">
    <v-chip v-if="user.active" color="green" prepend-icon="mdi-checkbox-marked-circle" variant="outlined">
        active
      </v-chip>
    <v-chip v-if="!user.active" color="red" prepend-icon="mdi-account-cancel" variant="outlined">
        inactive
      </v-chip>
    <span class="ms-4">{{ user.email }}</span>
    <v-tooltip activator="parent" location="bottom">{{ activeUserMessage }}</v-tooltip>
    </span>
    <v-btn v-if="user" href="#" @click="$store.dispatch('signout')">Sign Out</v-btn>
  </v-app-bar>
</template>

<script>
export default {
  name: "NavBar",
  computed: {
    user() {
      return this.$store.state.user;
    },
    activeUserMessage() {
      if (this.user && this.user.active) {
        return "This account is active and can use the tool.";
      }
      return "This account is inactive, please reach out to the Bellingcat team for access.";
    }
  },
};
</script>

<style>
.user {
  margin-right: 1em;
  font-size: 80%;
}

.nodecoration {
  color: inherit !important;
  text-decoration: none !important;
}
</style>
