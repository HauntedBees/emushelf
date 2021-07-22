import Vue from 'vue';
import VueGamepad from 'vue-gamepad';
import App from './App.vue';
import router from './plugins/router';
import vuetify from './plugins/vuetify';
import Daisywheel from './daisywheel/components/Daisywheel.vue';
import Loader from './components/Loader.vue';
import BeeTooltip from './components/BeeTooltip.vue';
import 'roboto-fontface/css/roboto/roboto-fontface.css';
import '@mdi/font/css/materialdesignicons.css';
import './directives/daisywheel';
import i18n from './plugins/i18n';

Vue.use(VueGamepad);
Vue.component("Loader", Loader);
Vue.component("Daisywheel", Daisywheel);
Vue.component("BeeTooltip", BeeTooltip);
Vue.config.productionTip = false;
new Vue({
  router,
  vuetify,
  i18n,
  render: h => h(App)
}).$mount("#app");