import Vue from 'vue'
import Vuex from 'vuex'

import { remote } from 'electron';
import path from 'path';
const { app } = remote;

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		udpath: app.getPath('userData'),
		userInfo: null
	},
	getters: {
		udpath: (state) => state.udpath,
	},
	mutations: {
	},
	actions: {
	},
	modules: {
	}
});
