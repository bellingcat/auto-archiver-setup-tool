import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import SheetView from '../views/SheetView.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/sheets',
    name: 'sheets',
    component: SheetView,
  },
  {
    path: '/privacy',
    name: 'Privacy Policy',
    component: () =>
      import(/* webpackChunkName: "privacy" */ '../views/PrivacyView.vue'),
  },
  {
    path: '/tos',
    name: 'Terms of Use',
    component: () =>
      import(/* webpackChunkName: "tos" */ '../views/TOSView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
