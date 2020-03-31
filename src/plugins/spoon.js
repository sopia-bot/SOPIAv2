import axios from 'axios';

class Spoon {
	constructor(api, token) {
		this.api = api || "https://api.spooncast.net";
		this.token = token;
		this.next = "";
		this.prev = "";
		this.ll = [];
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
				obj.headers['token'] = `Token ${this.token}`;
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
};

export default {
	Spoon: function(api, token) {
		return new Spoon(api, token);
	},
};
