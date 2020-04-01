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
import store from "./store";
import VueParticles from 'vue-particles';
import Transitions from 'vue2-transitions'
import './mixin/global.js';
import '@/assets/css/style.css';
import i18n from './plugins/i18n'
import router from "./router/router";

// plugin setup
Vue.use(DashboardPlugin);
Vue.use(VueParticles);
Vue.use(Transitions);

/* eslint-disable no-new */
new Vue({
	render: h => h(App),
	router,
	store,
	i18n,
}).$mount('#app');
