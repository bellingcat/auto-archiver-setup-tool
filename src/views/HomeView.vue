<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card style="margin-bottom: 1em">
          <v-card-text>
            <v-alert color="#f2d97c" light icon="mdi-alert">
              This is a pre-release prototype demo service provided on a
              best-effort basis. Do not use for mission critical or sensitive
              data.
            </v-alert>
            <p>
              This tool will configure a Google Sheet on your Google account for
              use with
              <a href="https://github.com/bellingcat/auto-archiver"
                >Bellingcat's Auto Archiver</a
              >. For more information about the Auto Archiver and how to use it,
              see
              <a href="https://github.com/bellingcat/auto-archiver"
                >our Github repository</a
              >
              and the
              <a
                href="https://www.bellingcat.com/resources/2022/09/22/preserve-vital-online-content-with-bellingcats-auto-archiver-tool/"
                >associated article</a
              >.
            </p>
            <ol style="margin-bottom: 1em">
              <li>Press "create" to create a new archiving Google Sheet</li>
              <li>
                Add links to the "Link" column. They will be archived every 15
                minutes, or you can trigger a manual archive below
              </li>
              <li>
                This sheet will be shared with the service account necessary for
                Bellingcat's archiving server
              </li>
              <li>
                You can modify and share the Google Sheet subsequently, but do
                not edit the column names in the header row or remove the
                service account from the shared users
              </li>
            </ol>
          </v-card-text>
        </v-card>
        <v-card>
          <v-card-title>Create a new auto archiver sheet</v-card-title>
          <v-card-text>
            <v-text-field
              label="Document name"
              v-model="docName"
              v-if="user"
            ></v-text-field>
            <v-btn
              @click="$store.dispatch('add', { name: docName })"
              :loading="$store.state.loading"
              v-if="user"
              >Create</v-btn
            >
            <v-alert v-if="!user" color="#f2d97c" light icon="mdi-alert"
              ><a href="#" @click="$store.dispatch('signin')"
                >Sign in with a Google account</a
              >
              to continue</v-alert
            >
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <DocList v-if="user" />
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
    };
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
  },
};
</script>
