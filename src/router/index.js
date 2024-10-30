import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import SheetView from '../views/SheetView.vue';
import UrlView from '../views/UrlView.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/sheets',
    name: 'Google Sheets Archiving',
    component: SheetView,
  },
  {
    path: '/urls',
    name: 'URL Archiving',
    component: UrlView,
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
