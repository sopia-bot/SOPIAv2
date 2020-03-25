import Vue from 'vue';
import { remote } from 'electron';
const { app } = remote;
import path from 'path';

Vue.mixin({
	methods: {
		/**
		 * @function getPath
		 * @param {string} path_
		 * 현재 프로그램이 시작된 경로를 기준으로,
		 * @path_ 의 절대 경로를 반환한다.
		 * @cur true 면 electron.exe 검사를 안 한다.
		 */
		p(path_ = "./", cur = false) {
			let exePath = app.getPath('exe');
			let exe = path.basename(exePath);
			let p = path.dirname(app.getAppPath());
			if ( !exe.match("electron") && cur === false ) {
				p = path.dirname(exePath);
			}
			return path.join(p, path_);
		},
	},
});
