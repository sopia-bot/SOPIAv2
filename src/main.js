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
import 'element-ui/lib/theme-chalk/index.css';
import i18n from './plugins/i18n'
import router from "./router/router";
import logger from './plugins/logger.js';
import electron from 'electron';
import fs from 'fs';
import path from 'path';

const { remote } = electron;
const { app } = remote;

// plugin setup
Vue.use(DashboardPlugin);
Vue.use(VueParticles);
Vue.use(Transitions);

// config
Vue.config.errorHandler = function(err, vm, info) {
	logger.critical('error', err);

	let str = "";
		str += `${new Date().toLocaleString()}\n`;
		str += `ReferenceError: ${err.message}\n`;
		str += `${err.stack.split('\n')[1]}\n`;
		str += `    - ${vm.$options._componentTag}::${info}\n\n`;

	
	const logDir = path.join(app.getPath('userData'), 'logs');
	if ( !fs.existsSync(logDir) ) {
		fs.mkdirSync(logDir);
	}
	const sTime = remote.getGlobal('startTime');
	const logFile = path.join(logDir, `${sTime}-error.log`);

	fs.appendFileSync(logFile, str, 'utf8');
};

/* eslint-disable no-new */
new Vue({
	render: h => h(App),
	router,
	store,
	i18n,
}).$mount('#app');
