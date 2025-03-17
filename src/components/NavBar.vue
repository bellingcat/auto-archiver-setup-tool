<template>
  <v-app-bar style="flex-grow: 0" class="text-no-wrap">
    <v-toolbar-title title="Bellingcat Auto Archiver prototype">
      <router-link to="/" class="nodecoration">
        Bellingcat Auto Archiver prototype
      </router-link>
    </v-toolbar-title>

    <v-chip
      v-if="$store.state.errorMessage"
      :title="$store.state.errorMessage"
      color="red"
      variant="tonal"
      closable
      class="mx-4"
    >
      ERROR: {{ $store.state.errorMessage }}
    </v-chip>

    <v-spacer v-if="!smAndDown"></v-spacer>
    <div v-if="user?.active && !smAndDown">
      <template v-for="btn in btns">
        <v-btn
          :to="btn.to"
          :prepend-icon="btn.icon"
          variant="text"
          class="nodecoration ml-2"
          size="large"
          active-color="teal"
        >
          {{ btn.text }}
          <v-tooltip activator="parent" location="bottom">{{
            btn.tooltip
          }}</v-tooltip>
        </v-btn>
      </template>
    </div>

    <v-spacer v-if="!smAndDown"></v-spacer>
    <span
      class="user mx-2 pa-2 bg-blue-grey-lighten-5 rounded elevation-2"
      v-if="user"
    >
      <span v-if="!loadingUserState">
        <v-chip
          v-if="user.active"
          color="green"
          class="bg-white"
          prepend-icon="mdi-checkbox-marked-circle"
          variant="outlined"
        >
          active
        </v-chip>
        <v-chip
          v-if="!user.active"
          color="red"
          class="bg-white"
          prepend-icon="mdi-account-cancel"
          variant="outlined"
        >
          inactive
        </v-chip>

        <v-tooltip activator="parent" location="bottom">{{
          activeUserMessage
        }}</v-tooltip>
      </span>
      <span class="ms-2">{{ user.email }}</span>
      <v-btn
        v-if="!smAndDown"
        prepend-icon="mdi-logout"
        variant="text"
        class="mx-2 elevation-2 bg-white"
        size="small"
        @click="$store.dispatch('signout')"
        >Sign Out</v-btn
      >
    </span>

    <v-btn v-if="!user" @click="$store.dispatch('signin')">Sign In</v-btn>

    <v-menu v-if="user?.active && smAndDown">
      <template v-slot:activator="{ props }">
        <v-app-bar-nav-icon v-bind="props"></v-app-bar-nav-icon>
      </template>
      <v-list>
        <v-list-item v-for="btn in btns" :key="btn.to" :to="btn.to">
          <v-btn
            :prepend-icon="btn.icon"
            variant="plain"
            class="nodecoration"
            size="large"
          >
            {{ btn.text }}
          </v-btn>
          <v-tooltip activator="parent" location="left">{{
            btn.tooltip
          }}</v-tooltip>
        </v-list-item>
        <v-list-item @click="$store.dispatch('signout')">
          <v-btn
            prepend-icon="mdi-logout"
            variant="plain"
            class="nodecoration"
            size="large"
            >Sign Out</v-btn
          >
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>
<script setup>
import { useDisplay } from "vuetify";
const { smAndDown } = useDisplay();
</script>

<script>
export default {
  name: "NavBar",
  data() {
    return {
      drawer: false,
      btns: [
        {
          to: "/",
          icon: "mdi-table-large",
          text: "Sheets",
          tooltip: "Create, manage, and archive Google Sheets.",
        },
        {
          to: "/url",
          icon: "mdi-cloud-download-outline",
          text: "URL",
          tooltip: "Archive a single URL.",
        },
        {
          to: "/archives",
          icon: "mdi-magnify",
          text: "Archives",
          tooltip: "Search for archived URLs.",
        },
      ],
    };
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
    activeUserMessage() {
      if (this.user && this.user.active) {
        return "This account has access to at least one feature.";
      }
      return "This account is inactive, please reach out to the Bellingcat team for access.";
    },
    loadingUserState() {
      return this.$store.state?.loadingUserState;
    },
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
