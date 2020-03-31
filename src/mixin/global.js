import Vue from 'vue';
import { remote } from 'electron';
const { app } = remote;
import path from 'path';
import fs from 'fs';
import vm from 'vm';

import s from '../plugins/spoon.js';
const Spoon = s.Spoon;

const jsOrPath = (code) => {
	try {
		if ( code.indexOf('\n') >= 0 ) return 'code';
		if ( path.extname(code) === '.js' ) return 'path';
	} catch(err) {
		return 'code';
	}
};

Vue.mixin({
	methods: {
		/**
		 * @function p
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
		/**
		 * @function up
		 * @param {string} path_
		 * %appdata%/SOPIA 의 경로를 기준으로,
		 * @path_ 의 절대 경로를 반환한다.
		 */
		up(path_ = "./") {
			return path.join(this.$store.getters.udpath, path_);
		},
		jsSyntax(code) {
			if ( jsOrPath(code) === 'path' ) {
				code = fs.readFileSync(code, { encoding: 'utf8' });
			}
			try {
				vm.createScript(code);
				return { result: true };
			} catch(err) {
				const sp = err.stack.split('\n');
				const line = sp[0].split(':')[1];
				const syntax = `${sp[1]}\n${sp[2]}`;
				return {
					result: false,
					msg: err.message,
					syntax,
					line,
					stack: err.stack,
				};
			}
		},
		$s(token, api) {
			if ( this._data._spoon ) {
				return this._data._spoon;
			}

			return this._data._spoon = new Spoon(api, token);
		},
		$remote() {
			return remote;
		},
	},
});
