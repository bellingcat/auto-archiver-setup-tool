<template>
  <v-app-bar style="flex-grow: 0" class="text-no-wrap">

    <v-toolbar-title>
      <router-link to="/" class="nodecoration">
        Bellingcat Auto Archiver demo
      </router-link>
    </v-toolbar-title>

    
    
    <v-chip v-if="$store.state.errorMessage" :title="$store.state.errorMessage" color="red" variant="tonal"
    closable class="mx-4">
    ERROR: {{ $store.state.errorMessage }}
  </v-chip>

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

    <v-btn v-if="!user" @click="$store.dispatch('signin')">Sign In</v-btn>

    <v-menu v-if="user">
      <template v-slot:activator="{ props }">
        <v-app-bar-nav-icon v-bind="props"></v-app-bar-nav-icon>
      </template>
      <v-list>
        <v-list-item to="urls">
          <v-btn prepend-icon="mdi-magnify" variant="plain">Search Archives</v-btn>
        </v-list-item>
        <v-list-item to="sheets">
          <v-btn prepend-icon="mdi-table-large" variant="plain">Sheet</v-btn>
        </v-list-item>
        <v-list-item @click="$store.dispatch('signout')">
          <v-btn prepend-icon="mdi-logout" variant="plain">Sign Out</v-btn>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>

</template>

<script>
export default {
  name: "NavBar",
  data() {
    return {
      drawer: false,
    };
  },
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
