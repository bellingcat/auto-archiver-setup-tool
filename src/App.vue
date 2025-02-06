<template>
  <v-app class="bg">
    <NavBar />
    <v-main>
      <router-view />
    </v-main>
    <v-footer class="text-center py-6">
      <v-row>
        <v-col cols="12">
          <div class="legal py-2">
            <router-link to="/privacy">Privacy Policy</router-link>
            <router-link to="/tos">Terms of Service</router-link>
          </div>
        </v-col>
        <v-col cols="12">
          You can deploy your own version of this tool by hosting the <a href="https://github.com/bellingcat/auto-archiver-api">API</a> and the <a href="https://github.com/bellingcat/auto-archiver-api">UI</a>.
          <br/>
          This tool uses <a href="https://github.com/bellingcat/auto-archiver">Bellingcat's Auto Archiver</a> under the hood to archive online content.
          <br/>
          For more information about it see <a
            href="https://www.bellingcat.com/resources/2022/09/22/preserve-vital-online-content-with-bellingcats-auto-archiver-tool/">associated
            article</a>.
          
        </v-col>
      </v-row>

    </v-footer>
  </v-app>
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
}

.pane-l {
  max-width: 1200px;
}

.bg {
  background-color: #b2dfdb !important;
}

html {
  background-color: #b2dfdb;
}

.legal a {
  margin-left: 2em;
  margin-right: 2em;
  color: inherit !important;
  font-weight: 500;
  background-color: rgba(0, 0, 0, 0.1);
  padding: 0.2em 0.4em;
}

footer,
.v-footer,
.v-footer div {
  margin: 0px;
  padding: 0px;
}

.v-footer {
  max-height: 125px;
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
