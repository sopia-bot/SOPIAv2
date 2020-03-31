import Vue from 'vue'
import Vuex from 'vuex'

import { remote } from 'electron';
import path from 'path';
const { app } = remote;

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		udpath: app.getPath('userData'),
		userInfo: null,
		fbUrl: "https://us-central1-sopia-bot.cloudfunctions.net",
	},
	getters: {
		udpath: (state) => state.udpath,
		fbUrl: (state) => state.fbUrl,
	},
	mutations: {
	},
	actions: {
	},
	modules: {
	}
});
