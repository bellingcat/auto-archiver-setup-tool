<template>
  <PermissionNeeded v-if="user && !featureEnabled" feature="Search Archives" />
  <v-container class="pane-l" v-if="user?.active && featureEnabled">
    <v-row>
      <v-col>
        <v-card elevation="12">
          <v-card-title class="text-center my-3">
            Search archives by URL
          </v-card-title>
          <v-card-text>
            <v-form>
              <v-row>
                <v-col cols="12" md="6">
                  <v-date-input v-model="queryAfter" label="Archived After" variant="outlined" min="2022-01-01"
                    :max="queryBefore || today"></v-date-input>
                </v-col>
                <v-col cols="12" md="6">
                  <v-date-input v-model="queryBefore" label="Archived Before" variant="outlined"
                    :min="queryAfter || '2022-01-01'" :max="today"></v-date-input>
                </v-col>
              </v-row>
              <v-text-field ref="searchInput" v-model="queryUrl" label="Search for this URL" prepend-icon="mdi-web"
                variant="outlined" :rules="[urlValidator]" required @keyup.enter="searchForArchives"></v-text-field>
              <v-row>
                <v-col cols="12" class="text-right">
                  <v-btn @click="searchForArchives" color="teal" class="mt-4" size="large" :disabled="!validUrl">
                    Search
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
            <v-row>
              <v-col>
                <v-snackbar v-model="snackbar" :timeout="4000" top right close-on-content-click>
                  {{ snackbarMessage }}
                  <template v-slot:actions>
                    <v-btn color="orange" variant="text" @click="snackbar = false">
                      Close
                    </v-btn>
                  </template>
                </v-snackbar>
                <v-data-table-server density="compact" loading-text="Loading... Please wait"
                  no-data-text="Nothing found" v-model:items-per-page="itemsPerPage" :headers="headers"
                  :items="serverItems" :items-length="totalItems" :loading="loading" :search="tableSearch"
                  @update:options="loadItems" :items-per-page-options="pageOptions" show-expand item-value="id"
                  fixed-header>
                  <template v-slot:item.result="{ item }">
                    <a :href="getUrlFromResult(item)" target="_blank" rel="noopener noreferrer">{{ item.result?.status
                      }}</a>
                  </template>
                  <template v-slot:item.url="{ item }">
                    <a :href="item.url" target="_blank" rel="noopener noreferrer">{{ item.url }}</a>
                  </template>
                  <template v-slot:item.created_at="{ item }">
                    <time :datetime="item?.created_at">{{ item?.created_at }}</time>
                  </template>
                  <template v-slot:item.size="{ item }">
                    {{ ((item?.result?.metadata?.total_bytes || 0) / (1024 * 1024)).toFixed(2) }}
                  </template>
                  <template v-slot:item.files="{ item }">
                    {{ item?.result?.media?.length }}
                  </template>

                  <!-- EXPANDED ROW WITH SUBTABLE -->
                  <template v-slot:expanded-row="{ columns, item }">
                    <tr>
                      <td :colspan="columns.length" class="pa-0">
                        <v-data-table density="compact" class="sub-table elevation-0 bg-blue-grey-lighten-5"
                          :items="item?.result?.media" item-key="key" hide-default-footer :headers="fileHeaders">

                          <template v-slot:item.preview="{ item: media }">
                            <a :href="media.urls[0]" target="_blank">
                              <template v-if="media._mimetype?.startsWith('image/')">
                                <v-img :src="media.urls[0]" max-width="150" max-height="250" class="mx-auto"></v-img>
                              </template>
                              <template v-else-if="media._mimetype?.startsWith('video/')">
                                <video :src="media.urls[0]" controls style="max-width: 150px; max-height: 200px;"
                                  class="mx-auto"></video>
                              </template>
                              <template v-else>
                                <span>{{ media?.properties?.id }}</span>
                              </template>
                            </a>
                          </template>
                          <template v-slot:item.hash="{ item: media }">
                            <span style="font-size: small;">{{ media?.properties?.hash }}</span>
                          </template>
                        </v-data-table>
                      </td>
                    </tr>
                  </template>
                </v-data-table-server>
              </v-col>
            </v-row>
          </v-card-text>

        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import PermissionNeeded from "@/components/PermissionNeeded.vue";
import { urlValidator, getUrlFromResult } from "@/utils/misc.js";

export default {
  name: "ArchiveSearchView",
  components: {
    PermissionNeeded
  },
  data() {
    return {
      today: new Date().toISOString().substring(0, 10),
      queryAfter: null,
      queryBefore: null,
      queryUrl: this.$route.query.url || "https://",
      tableSearch: "", // used to retrigger the search
      loading: false,
      itemsPerPage: 5,
      totalItems: 0,
      pageOptions: [{ value: 5, title: '5' }, { value: 10, title: '10' }, { value: 25, title: '25' }, { value: 50, title: '50' }],
      headers: [
        { title: "URL", value: "url" },
        { title: "Result", value: "result" },
        { title: "Archived At", value: "created_at" },
        { title: "Size (MB)", value: "size" },
        { title: "Files", value: "files" },
        { title: '', key: 'data-table-expand' },
      ],
      fileHeaders: [
        { title: 'Preview', value: 'preview', align: 'center' },
        { title: 'Hash', value: 'hash', align: 'end', width: '150px' },
        { title: 'Size', value: 'properties.size', align: 'end', width: '150px' }
      ],
      serverItems: [],
      snackbar: false,
      snackbarMessage: "",
    };
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
    featureEnabled() {
      const read = this.user?.permissions?.['all']?.read
      if (read === true) {
        return true;
      }
      if (Array.isArray(read) && read.length > 0) {
        return true;
      }
      return this.user?.permissions?.['all']?.read_public
    },
    validUrl() {
      return this.queryUrl && this.urlValidator(this.queryUrl) === true;
    },
    urlValidator() {
      return urlValidator;
    },
    getUrlFromResult() {
      return getUrlFromResult;
    },
  },
  methods: {
    searchForArchives() {
      if (!this.validUrl) return;
      this.tableSearch = `${this.queryUrl}${this.queryAfter}${this.queryBefore}`;
    },
    loadItems({ page, itemsPerPage, sortBy }) {
      if (!this.validUrl || this.loading === true) return;
      this.loading = true;

      const params = new URLSearchParams({
        url: this.queryUrl,
        limit: itemsPerPage,
        skip: (page - 1) * itemsPerPage,
      });
      if (this.queryAfter) {
        params.append("archived_after", this.queryAfter.toISOString());
      }
      if (this.queryBefore) {
        params.append("archived_before", this.queryBefore.toISOString());
      }


      fetch(`${this.$store.state.API_ENDPOINT}/url/search?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.$store.state.access_token}`,
        }
      }).then(response => response.json())
        .then(items => {
          if (!Array.isArray(items)) {
            throw (`Unexpected response format from API`);
          }

          // Estimate totalItems if not provided by the API
          this.serverItems = items;
          if (items.length < itemsPerPage) {
            this.totalItems = (page - 1) * itemsPerPage + items.length;
          } else {
            this.totalItems = (page + 1) * itemsPerPage; // Assume there are more items
          }
        })
        .catch(error => {
          console.error("/url/search", error);
          this.snackbarMessage = `Error searching for archives: ${error}`;
          this.snackbar = true;
        })
        .finally(() => {
          this.loading = false;
        });
    }
  },
};
</script>

<style>
img,
video {
  filter: grayscale(100%);
}

img:hover,
video:hover {
  filter: none;
}

td {
  word-break: break-all;
}
</style>
