<template>
  <div class="pane">
    <v-app>
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
  box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.25);
}

html {
  background-color: #d6e8de;
}
</style>
