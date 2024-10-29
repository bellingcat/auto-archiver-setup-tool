<template>
  <v-container>
    <v-row>
      <v-col>
        <v-alert color="#f2d97c" icon="mdi-alert" >
          This is a prototype demo service provided on a
          best-effort basis. <br />Do not use for mission critical or sensitive
          data.
        </v-alert>
        <v-alert color="orange" icon="mdi-information" v-if="user && !user.active" >
          To use this tool you need a Google account and <strong>permission from the Bellingcat team</strong>.<br/>
          You can do so HERE: TODO.
        </v-alert>
        <v-card style="margin-bottom: 1em">
          <v-card-text>
            <v-card-title class="text-center">
              Welcome to the Auto Archiver Setup Tool
            </v-card-title>
            <p>
              This tool can be used to archive digital content via single <router-link to="/urls">URLs</router-link> or
              <router-link to="/sheets">Google sheets</router-link>.
            </p>
            <blockquote>
              To use this tool you need a Google account and <strong>permission from the Bellingcat team</strong>.
            </blockquote>
            <p>
              This tool uses <a href="https://github.com/bellingcat/auto-archiver">Bellingcat's Auto Archiver</a> to
              archive online content. For more information about the Auto Archiver see
              <a href="https://github.com/bellingcat/auto-archiver">our Github repository</a>
              and the <a
                href="https://www.bellingcat.com/resources/2022/09/22/preserve-vital-online-content-with-bellingcats-auto-archiver-tool/">associated
                article</a>.
            </p>
          </v-card-text>
        </v-card>

      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import DocList from "@/components/DocList.vue";

export default {
  name: "HomeView",
  components: {
    DocList,
  },
  data() {
    return {
      docName: "Auto archiver sheet",
      spreadsheetUrl: "",
    };
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
    spreadsheetId() {
      if (
        this.spreadsheetUrl.startsWith("http") &&
        this.spreadsheetUrl.split("/").length >= 6
      ) {
        return this.spreadsheetUrl.split("/")[5];
      }
      return this.spreadsheetUrl;
    },
  },
  methods: {},
};
</script>
