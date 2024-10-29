import { createApp } from "vue";
import { createVuetify } from "vuetify";
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
import "./styles/global.css";

const vuetify = createVuetify({
  components,
  directives,
});

const app = createApp(App);

app.use(router);
app.use(store);
app.use(vuetify);

app.mount("#app");
