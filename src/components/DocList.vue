<template>
  <div>
    <div class="text-h5 mt-5 mb-3" v-if="docs.length > 0">
      Your auto-archiver documents
    </div>
    <v-row v-for="doc in docs" :key="doc.sheetId">
      <v-col>
        <DocCard :doc="doc" />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import DocCard from "@/components/DocCard.vue";

export default {
  name: "DocList",
  components: {
    DocCard,
  },
  computed: {
    docs() {
      return this.$store.state.docs;
    },
  },
};
</script>

<style></style>
