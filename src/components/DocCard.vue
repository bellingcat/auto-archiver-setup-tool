<template>
  <v-card class="doc">
    <v-card-title>{{ doc.name }}</v-card-title>
    <v-card-text>
      <div class="doc-timestamp">
        Created: {{ new Date(doc.timestamp).toLocaleString() }}
      </div>
      <div class="doc-archived">
        Last archived:
        {{
          doc.lastArchived
            ? new Date(doc.lastArchived).toLocaleString()
            : "never"
        }}
      </div>
      <div class="doc-id">ID: {{ doc.sheetId }}</div>
    </v-card-text>
    <v-card-actions>
      <v-col>
        <v-btn :href="doc.url" target="_blank"
          >Open sheet
          <v-icon>mdi-open-in-new</v-icon>
        </v-btn>
      </v-col>
      <v-col>
        <v-btn>Archive now</v-btn>
      </v-col>
      <v-dialog width="500" v-model="dialog" persistent :retain-focus="false">
        <template v-slot:activator="{ on, attrs }">
          <v-col class="text-right">
            <v-btn color="red lighten-2" right v-bind="attrs" v-on="on"
              >Stop archiving</v-btn
            >
          </v-col>
        </template>

        <v-card>
          <v-card-title>Stop archiving "{{ doc.name }}"? </v-card-title>

          <v-card-text>
            This will stop archiving the sheet, but will not delete the sheet or
            any of its data from your Google Drive.
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-btn @click="dialog = false" color="primary">Cancel</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="red" text @click="remove"> Stop archiving </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: "DocCard",
  props: {
    doc: Object,
  },
  data() {
    return {
      dialog: false,
    };
  },
  methods: {
    remove() {
      this.dialog = false;
      this.$store.dispatch("removeDoc", this.doc.id);
    },
  },
};
</script>
