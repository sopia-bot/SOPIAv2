// native modules
import vm from 'vm';
import fs from 'fs';
import path from 'path';

// package modules
import axios from 'axios';
import electron from 'electron';
import watch from 'node-watch';

// author modules
import Live from './live.js';
import Sopia from './sopia.js';

// global variables
const { remote } = electron;
const { app } = remote;
const sopiaPath = path.join(app.getPath('userData'), 'sopia');

const OBJDump = (obj) => {
	switch ( typeof obj ) {
		case "object":
			return Object.assign( Object.create( Object.getPrototypeOf(obj)), obj);
		case "number":
			return obj * 1;
		case "string":
			return obj.toString();
		default:
			return obj;
	}
};

class Spoon {
	constructor(token, api) {
		this.api = api || "https://api.spooncast.net";
		this.home = "https://spooncast.net";
		this.token = token || "";
		this.next = "";
		this.prev = "";
		this.ll = [];
		this.Lives = {};
		this.var = {};
		this.script = {};
		this.$sopia = Sopia;
	}

	__getToken() {
		return `Token ${this.token}`;
	}

	$req(method, url, data) {
		let reqUrl = url;
		if ( !url.match(/^https:\/\//) ) {
			reqUrl = `${this.api}${url}`;
		}
		return new Promise((resolve, reject) => {
			const obj = {
				url: reqUrl,
				method,
				headers: {
					'accept': "application/json",
					'cache-control': "no-cache",
					'pragma': "no-cache",
				},
			};
			
			const token = this.__getToken();
			if ( typeof token === "string" && token.length > 0 ) {
				obj.headers.authorization = this.__getToken();
			}

			if ( typeof data === "object" ) {
				obj.data = data;
			}

			axios(obj)
				.then(res => {
					resolve(res.data);
				})
				.catch(reject);
		});
	}

	get liveList() {
		return this.ll;
	}

	getLive() {
		return new Promise((resolve, reject) => {
			this.$req('get', '/lives/popular/')
				.then(res => {
					this.next = res.next;
					this.ll = res.results;
					resolve(this.ll);
				})
				.catch(reject);
		});
	}

	getLiveNext() {
		return new Promise((resolve, reject) => {
			if ( this.next === "" ) {
				this.$req('get', '/lives/popular/')
					.then(res => {
						this.next = res.next;
						this.ll = res.results;
						resolve(this.ll);
					})
					.catch(reject);
			} else {
				if ( this.next !== this.prev ) {
					this.$req('get', this.next)
						.then(res => {
							if ( res.next === "" ) {
								throw new Error('Load live finish.');
							}
							this.prev = this.next;
							this.next = res.next;
							this.ll = this.ll.concat(res.results);
							resolve(res.results);
						})
						.catch(reject);
				} else {
					resolve("finish");
				}
			}
		});
	}

	login(id, pw) {
		return new Promise((resolve, reject) => {
			let type = "";
			if ( id.match(/.*\@.*\..*/) ) {
				type = "email";
			} else if ( id.match(/[0-9]+/) ) {
				type = "phone";
			} else {
				reject(new Error('login.error.invalid-id'));
				return;
			}

			// 0: 회원정보 없음

			this.$req('post', '/signin/', {
				country: "kr",
				password: pw,
				sns_id: id,
				sns_type: type,
			})
			.then(res => {
				if ( res.results.length === 0 ) {
					throw new Error('No have data');
				}
				resolve(res.results[0]);
			})
			.catch(reject);
		});
	}

	snsLogin(type) {
		return new Promise((resolve, reject) => {
			const url = `${this.home}/oauth/authorize?sns_type=${type}&is_agree=false&ts=${new Date().getTime()}`
			remote.getGlobal('snsLoginOpen')(url)
				.then(res => {
					const data = JSON.parse(res);
					if ( data.status_code === 403 ) {
						// fail
						data.result.result_code = 0;
						data.result.result_message = "Fail";
					}
					resolve(data.result);
				})
				.catch(reject);
		});
	}

	$live(live_id, _config) {
		const l = this.Lives[live_id];
		if ( l ) {
			return l;
		}

		const config = {
			auth: this.token,
		};

		const ckeys = Object.keys(_config || {});
		ckeys.forEach((k) => {
			config[k] = _config[k];
		});

		return this.Lives[live_id] = new Live(live_id, config);
	}

	liveInfo(live_id) {
		let data = undefined;
		if ( this.token && this.token.length > 0 ) {
			data = {};
		}

		return new Promise((resolve, reject) => {
			this.$req('get', `/lives/${live_id}`, data)
				.then(res => {
					resolve(res.results[0]);
				})
				.catch(reject);
		});
	}

	search(keyword) {
		return new Promise((resolve, reject) => {
			this.$req('get', `/search/user/?keyword=${keyword}`)
				.then(res => {
					resolve(res.results);
				})
				.catch(reject);
		});
		
		///search/user/?keyword=asdj
	}

	subscribedLive() {
		return new Promise((resolve, reject) => {
			this.$req('get', '/lives/subscribed/', {})
				.then(res => {
					resolve(res.results);
				})
				.catch(reject);
		});
	}

	likeLive(live_id) {
		return new Promise((resolve, reject) => {
			this.$req('post', `/lives/${live_id}/like/`, {})
				.then(res => {
					resolve(res.results);
				})
				.catch(reject);
		});
	}

	getImg(sticker) {
		return require(`assets/imgs/spoon/${sticker}.png`);
	}


	__loadEvtScript(type) {
		const p = path.join(sopiaPath,  type) + ".js";
		if ( fs.existsSync(p) ) {
			const code = fs.readFileSync(p, {encoding: 'utf8'});
			this.script[type] = code;
			return true;
		} else {
			console.error(`${p} is not exists.`);
			return false;
		}
	}

	__reloadEvtScript() {
		if ( typeof this.script === "object" ) {
			const types = Object.keys(this.script);
			types.forEach((type) => {
				this.__loadEvtScript(type);
			});
		}
	}

	__createContext(live_id) {
		if ( !this.vmContext ) {
			this.vmContext = {
				'sopia': {
					var: this.var,
					itv: Sopia.itv,
					isRun: true,
				},
				'live': this.$live(live_id),
				'console': console,
				'extra': {},
			};

			this.$emit(0, 'main', {});

			watch(sopiaPath, { recursive: true }, (evt, name) => {
				const stats = fs.statSync(name);
				if ( !stats.isDirectory() ) {
					this.__reloadEvtScript();
				}
			});
		}
		return OBJDump(this.vmContext);
	}

	__getContext() {
		return this.vmContext;
	}

	__patchContext(context) {
		const oriContext = this.__getContext();
		const oriKeys = Object.keys(oriContext);
		oriKeys.forEach((k) => {
			delete oriContext[k];
			oriContext[k] = OBJDump(context[k]);
		});

		const ctKeys = Object.keys(context.extra);
		ctKeys.forEach((k) => {
			if ( oriContext[k] ) {
				delete oriContext[k];
			}
			oriContext[k] = OBJDump(context.extra[k]);
		});
		context.extra = {};
	}

	$emit(live_id, evt, msg) {
		if ( msg.useragent === "Server" ) return;

		const type = evt.replace("live_", "");
		if ( !this.script[type] ) {
			if ( !this.__loadEvtScript(type) ) {
				return;
			}
		}

		const context = this.__createContext(live_id);
		if ( context.sopia.isRun ) {
			context.spoon = OBJDump(msg.data);
			vm.createContext(context);
			const script = new vm.Script(this.script[type]);
			try {
				script.runInContext(context);
			} catch(err) {
				console.error(err);
			}
			delete context.spoon;
			this.__patchContext(context);
		}
	}

	follow(user) {
		return new Promise((resolve, reject) => {
			this.$req('post', `/users/${user}/follow/`)
				.then(res => {
					resolve(res.results[0]);
				})
				.catch(reject);
		});
	}

	unfollow(user) {
		return new Promise((resolve, reject) => {
			this.$req('post', `/users/${user}/unfollow/`)
				.then(res => {
					resolve(res.results[0]);
				})
				.catch(reject);
		});
	}

	mini_profile(user) {
		return new Promise((resolve, reject) => {
			this.$req('get', `/users/${user}/mini_profile/`)
				.then(res => {
					resolve(res.results[0]);
				})
				.catch(reject);
		});
	}

	managerApply(live_id, managers) {
		return new Promise((resolve, reject) => {
			this.$req('post', `/lives/${live_id}/manager/`, { manager_ids: managers })
				.then(res => {
					resolve(res.results[0]);
				})
				.catch(reject);
		});
	}

	blockUser(live_id, user_id) {
		return new Promise((resolve, reject) => {
			this.$req('post', `/lives/${live_id}/block/`, { block_user_id: user_id })
				.then(res => {
					resolve(res.results[0]);
				})
				.catch(reject);
		});
	}
};

export default {
	Spoon: function(api, token) {
		return new Spoon(api, token);
	},
};
