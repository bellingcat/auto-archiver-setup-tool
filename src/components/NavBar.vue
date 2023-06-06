<template>
  <v-app-bar style="flex-grow: 0" class="text-no-wrap">
    <v-toolbar-title>Bellingcat Auto Archiver demo tool</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn v-if="!user" @click="$store.dispatch('signin')">Sign In</v-btn>
    <span class="user" v-if="user">
      {{ user.email }}
    </span>
    <v-btn v-if="user" href="#" @click="$store.dispatch('signout')"
      >Sign Out</v-btn
    >
  </v-app-bar>
</template>

<script>
export default {
  name: "NavBar",
  computed: {
    user() {
      return this.$store.state.user;
    },
  },
};
</script>

<style>
.user {
  margin-right: 1em;
  font-size: 80%;
}
</style>
