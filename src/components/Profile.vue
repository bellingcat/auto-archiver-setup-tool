<template>
  <div
    class="card horizontal"
    style="max-width: 400px; margin: 0 auto"
    v-if="user"
  >
    <div class="card-image" style="margin-top: 25px; margin-left: 10px">
      <img
        :src="user.photoURL"
        style="
          width: 75px;
          height: 75px;
          border-radius: 50%;
          border: 4px solid #333;
        "
      />
    </div>
    <div class="card-stacked">
      <div class="card-content">
        <p>
          name: <strong>{{ user.displayName }}</strong
          ><br />email:<strong>{{ user.email }}</strong
          ><br />uid: <strong>{{ user.uid }}</strong> <br />provider:
          <strong class="teal-text">{{
            user.providerData[0].providerId
          }}</strong>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ProfileView",
  data() {
    return {
      items: [],
    };
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
  },
};
</script>

<style></style>
