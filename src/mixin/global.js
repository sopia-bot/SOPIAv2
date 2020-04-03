import Vue from 'vue';
import { remote } from 'electron';
const { app } = remote;
import path from 'path';
import fs from 'fs';
import vm from 'vm';
import axios from 'axios';
import os  from 'os';

import s from '@/spoon/';
const Spoon = s.Spoon;

import c from '@/plugins/config.js';
const Config = c.Config;

const jsOrPath = (code) => {
	try {
		if ( code.indexOf('\n') >= 0 ) return 'code';
		if ( path.extname(code) === '.js' ) return 'path';
	} catch(err) {
		return 'code';
	}
};

// 사용자 컴퓨터의 UUID를 생성한다.
function generateUUID() {
	generateUUID.tail = generateUUID.tail || (function(nics) {
		var nic, index, addr, retn;
		for (nic in nics) { // try to obtain the MAC address from the IPv6 scope-local address
			for (index in nics[nic]) {
				addr = nics[nic][index];
				if (!addr.internal) {
					if (addr.address.indexOf('fe80::') === 0) { // found scope-local
						retn = retn || addr.address.slice(6).split(/:/).map(function(v, i, a) {
							return parseInt(v, 16);
						});
					}
				}
			}
		}
		if (!retn) { // no IPv6 so generate random MAC with multicast bit set
			index = Math.pow(2, 16);
			retn = [1, 2, 3, 4];
		}
		retn[3] = 0x10000 | retn[3];
		retn[2] = 0x10000 | retn[1] & 0xff00 | retn[2] & 0x00ff; // eliminate FFFE from xxxx:xxFF:FExx:xxxx
		retn[1] = 0x10000 | retn[0] ^ 0x0200; // invert bit#41
		retn = retn.map(function(v, i, a) {
			return v.toString(16).slice(1)
		});
		return retn[0] + '-' + retn[1] + retn[2] + retn[3];
	})(os.networkInterfaces());
	
	var head = [5, 6];
	return head.concat(generateUUID.tail).join('-');
};

const configs = {
	app: new Config(path.join(app.getPath('userData'), 'config.json')),
}

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
		$http: axios,
		generateUUID,
		$cfg(key) {
			return configs[key];
		},
		// Vue route 이동
		$assign(url) {
			const router = this && this.$router;
			if ( typeof url === "string" && router ) {
				if ( router.history.current.path !== url ) {
					router.push({ path: url });
				}
			}
		},
	},
});
