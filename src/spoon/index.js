import axios from 'axios';
import electron from 'electron';
const { remote } = electron;
import Live from './live.js';

class Spoon {
	constructor(token, api) {
		this.api = api || "https://api.spooncast.net";
		this.home = "https://spooncast.net";
		this.token = token || "";
		this.next = "";
		this.prev = "";
		this.ll = [];
		this.Lives = {};
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

			if ( typeof data === "object" ) {
				obj.data = data;
				obj.headers.authorization = this.__getToken();
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
		return new Promise((resolve, reject) => {
			this.$req('get', `/lives/${live_id}`)
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
};

export default {
	Spoon: function(api, token) {
		return new Spoon(api, token);
	},
};
