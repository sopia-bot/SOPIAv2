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
		popupSpoon: false,
	},
	getters: {
		udpath: (state) => state.udpath,
		fbUrl: (state) => state.fbUrl,
		popupSpoon: (state) => state.popupSpoon,
	},
	mutations: {
		popupSpoon (state, val) {
			state.popupSpoon = val;
		}
	},
	actions: {
	},
	modules: {
	}
});
