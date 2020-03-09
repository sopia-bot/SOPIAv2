/*!

=========================================================
* Vue Argon Dashboard PRO - v1.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard
* Copyright 2019 Creative Tim (https://www.creative-tim.com)

* Coded by www.creative-tim.com

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import Vue from 'vue';
import DashboardPlugin from './plugins/dashboard-plugin';
import App from './App.vue';
import VueParticles from 'vue-particles';


import '@/assets/css/style.css';

// router setup
import router from './router/index';
// plugin setup
Vue.use(DashboardPlugin);
Vue.use(VueParticles);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
  router
});
