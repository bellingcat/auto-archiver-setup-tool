<template>
  <ArchiveSheet v-if="user?.active" />
  <ManageSheets v-if="user?.active" />
</template>

<script>
import ArchiveSheet from "@/components/ArchiveSheet.vue";
import ManageSheets from "@/components/ManageSheets.vue";

export default {
  name: "SheetView",
  components: {
    ArchiveSheet, ManageSheets
  },
  data() {
    return {

    };
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
  },
  methods: {},
};
</script>
