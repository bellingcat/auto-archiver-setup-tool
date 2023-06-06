<template>
  <div class="pane">
    <v-app class="bg">
      <NavBar />
      <v-main>
        <router-view />
      </v-main>
    </v-app>
  </div>
</template>

<script>
import NavBar from "@/components/NavBar.vue";

export default {
  name: "App",
  components: {
    NavBar,
  },
};
</script>

<style>
.pane {
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  height: 100vh;
  background-color: #d6e8de !important;
}

.bg {
  background-color: #d6e8de !important;
}

html {
  background-color: #d6e8de;
}
</style>
