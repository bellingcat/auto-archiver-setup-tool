import Vue from "vue";
import VueRouter from "vue-router";
import HomeView from "../views/HomeView.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/privacy",
    name: "Privacy Policy",
    component: () =>
      import(/* webpackChunkName: "privacy" */ "../views/PrivacyView.vue"),
  },
  {
    path: "/tos",
    name: "Terms of Use",
    component: () =>
      import(/* webpackChunkName: "tos" */ "../views/TOSView.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
