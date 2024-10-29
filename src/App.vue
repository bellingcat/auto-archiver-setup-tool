<template>
  <div class="pane">
    <v-app class="bg">
      <NavBar />
      <v-main>
        <router-view />
      </v-main>
      <v-footer class="legal">
        <router-link to="/privacy">Privacy Policy</router-link>
        <router-link to="/tos">Terms of Service</router-link>
      </v-footer>
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
:root {
  --v-card-text-opacity: 0.85;
}

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

.legal a {
  margin-left: 2em;
  margin-right: 2em;
  color: inherit !important;
}

.legal {
  justify-content: center;
  max-height: 50px;
}

ol,
ul {
  padding-left: 16px;
}

p {
  margin-bottom: 16px;
}

.v-alert {
  margin-bottom: 16px;
}

code {
  background-color: rgba(0, 0, 0, .1);
  padding: .2em .4em;
}

.v-card .v-card-text {
  font-size: 1.1rem;
  font-weight: 400;
  line-height: 1.7rem;
  letter-spacing: .0092em;
}
</style>
