import { createApp } from "vue";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { VDateInput } from "vuetify/labs/VDateInput";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import moment from "moment";
import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
import "./styles/global.css";

const vuetify = createVuetify({
  components: { ...components, VDateInput },
  directives,
});

const app = createApp(App);

app.use(router);
app.use(store);
app.use(vuetify);
app.config.globalProperties.$moment = moment;

app.mount("#app");
