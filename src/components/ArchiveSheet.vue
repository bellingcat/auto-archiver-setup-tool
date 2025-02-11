<template>
  <v-container class="pane">
    <v-card class="pa-0">

      <v-tabs v-model="tab" bg-color="teal" grow class="elevation-1">
        <v-tab v-for="item in items" :key="item" :text="item" :value="item"></v-tab>
      </v-tabs>

      <v-tabs-window v-model="tab" class="elevation-1 rounded">
        <v-tabs-window-item :value="items[0]">
          <v-card-text>
            <AddSheet :actionIsCreate="true" />
            <v-expansion-panels elevation="0">
              <v-expansion-panel>
                <v-expansion-panel-title>Instructions</v-expansion-panel-title>
                <v-expansion-panel-text>
                  <ol>
                    <li>Choose a sheet name</li>
                    <li>Choose a group: this will impact where/how to archive</li>
                    <li>Choose a frequency: how often to archive</li>
                    <li>Press "create" and wait</li>
                    <li>Sheet will appear in "Your Sheets" below</li>
                  </ol>
                  <small>
                    <b>NB:</b> This new sheet will be shared with the
                    service account necessary for Bellingcat's archiving
                    server.
                  </small>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-tabs-window-item>
        <v-tabs-window-item :value="items[1]">
          <v-card-text>
            <AddSheet :actionIsCreate="false" />
            <v-expansion-panels elevation="0">
              <v-expansion-panel>
                <v-expansion-panel-title>Instructions</v-expansion-panel-title>
                <v-expansion-panel-text>
                  <ol style="margin-bottom: 1em">
                    <li>Choose a group to associate with this Google Sheet</li>
                    <li>Invite the provided email as Editor to your Google Sheet</li>
                    <li>
                      Make sure you have the following <b>mandatory</b> column names:
                      <ul>
                        <li><code>Link</code> where you will put the URLs</li>
                        <li>
                          <code>Archive Status</code> to monitor progress and success
                          of archiver
                        </li>
                        <li>
                          <code>Archive location</code> where the link to the archived
                          content is added
                        </li>
                      </ul>
                    </li>
                    <li>
                      Add any of the following <b>optional</b> column names:
                      <ul>
                        <li>
                          <code>Archive date</code> info on when archiving occurred
                        </li>
                        <li>
                          <code>Thumbnail</code> an image preview from archived media
                        </li>
                        <li>
                          <code>Upload timestamp</code> online content creation date
                        </li>
                        <li><code>Upload title</code> title</li>
                        <li><code>Textual content</code> text content</li>
                        <li><code>Screenshot</code> link to page screenshot</li>
                        <li>
                          <code>Hash</code> content hash (for integrity purposes)
                        </li>
                      </ul>
                    </li>
                    <li>Choose a name to associate with this Sheet</li>
                    <li>Paste the Google Sheet URL</li>
                    <li>Press "enable" to add the Google Sheet to your list</li>
                    <li>
                      Manually check archiving is working and re-check the steps above
                      if it is not
                    </li>
                  </ol>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card>
  </v-container>

</template>

<script>
import AddSheet from "@/components/AddSheet.vue";

export default {
  name: "ArchiveSheet",
  components: {
    AddSheet
  },
  data() {
    return {
      tab: '',
      items: ['Create new Archiver Sheet', 'Add existing Sheet'],
    };
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
  },
};
</script>