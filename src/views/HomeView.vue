<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title>Create a new auto archiver sheet</v-card-title>
          <v-card-text>
            <p>
              This tool will configure a Google Sheet on your account for use
              with Bellingcat's auto archiver. This sheet will be shared with
              the service account necessary for Bellingcat's archiving server.
              You can modify and share the Google Sheet subsequently, but do not
              edit the column names in the header row or remove the service
              account from the shared users.
            </p>

            <p>
              Links to online sources added to the "Link" column will be
              archived every 15 minutes, or can be triggered manually below. For
              more information about the auto archiver and how to use it, see
              <a href="https://github.com/bellingcat/auto-archiver"
                >our Github repository</a
              >
              and the
              <a
                href="https://www.bellingcat.com/resources/2022/09/22/preserve-vital-online-content-with-bellingcats-auto-archiver-tool/"
                >associated article</a
              >.
            </p>
            <v-text-field
              label="Document name"
              v-model="docName"
            ></v-text-field>
            <v-btn
              @click="$store.dispatch('add', { name: docName })"
              :loading="$store.state.loading"
              >Add</v-btn
            >
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <DocList v-if="user" />

    <v-row v-else
      ><v-col
        ><v-alert color="#f2d97c" light icon="mdi-alert"
          >Sign in to set up an auto archiver</v-alert
        ></v-col
      ></v-row
    >
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
