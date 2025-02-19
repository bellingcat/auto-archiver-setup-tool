<template>
  <v-snackbar
    v-model="visible"
    :timeout="timeout"
    :top="top"
    :bottom="bottom"
    close-on-content-click
  >
    {{ message }}
    <template v-slot:actions>
      <v-btn :color="color" variant="text" @click="visible = false">
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
export default {
  name: "MySnackBar",
  props: {
    message: {
      type: String,
      required: true,
    },
    timeout: {
      type: Number,
      default: 5000,
    },
    color: {
      type: String,
      default: "orange",
    },
    top: {
      type: Boolean,
      default: false,
    },
    bottom: {
      type: Boolean,
      default: true,
    },
    show: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      visible: this.show,
    };
  },
  watch: {
    show(val) {
      this.visible = val;
    },
    visible(val) {
      if (!val) {
        this.$emit("update:show", false);
      }
    },
  },
};
</script>
