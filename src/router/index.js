import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import ArchivesView from '../views/ArchivesView.vue';

import ArchiveUrl from "../components/ArchiveUrl.vue";

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/url',
    name: 'URL Archiving',
    component: ArchiveUrl,
  },
  {
    path: '/archives',
    name: 'Archives search',
    component: ArchivesView,
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
