export default class Live {
	constructor(live_id, config = {}, wsServer) {
		this.live_id = live_id.toString();
		this.auth = "";
		this.appVersion = "4.1.16";
		this.wsServer = wsServer || "wss://heimdallr.spooncast.net";
		this.isConnect = false;
		this.healthIntTerm = 30;

		const keys = Object.keys(config);
		keys.forEach(k => {
			this[k] = config[k];
		});

	}

	__send(msg) {
		return this.ws.send(JSON.stringify(msg));
	}

	__health() {
		const msg = {
			appversion:this.appVersion,
			event:"live_health",
			live_id:this.live_id,
			type:"live_rpt",
			useragent:"Web",
		};
		
		if ( this.auth ) {
			msg['user_id'] = this.user_id;
		}
		this.__send(msg);
	}

	set onmessage(callback = () => {}) {
		this.onmsgcb = callback;
	}

	set onclose(callback = () => {}) {
		this.ws.onclose = callback;
	}

	connect() {
		if ( this.isConnect ) {
			return false;
		}

		this.ws = new WebSocket(`${this.wsServer}/${this.live_id}`);
		this.ws.onmessage = (msg) => {
			const e = JSON.parse(msg.data);

			if ( e.event === "live_state" ) {
				this.healthInterval = setInterval(() => {
					this.__health();
				}, (this.healthIntTerm * 1000));
				this.isConnect = true;

				if ( this.auth ) {
					this.join();
				}
			}

			if ( e.data && e.data.live && e.data.live.id ) {
				this.info = e.data.live;
			}

			if ( typeof this.onmsgcb === "function" ) {
				this.onmsgcb(e);
			}
		};
		this.ws.onopen = () => {
			const msg = {
				appversion:this.appVersion,
				event:"live_state",
				live_id:this.live_id,
				type:"live_req",
				useragent:"Web",
			};
			if ( this.auth ) {
				msg['user_id'] = this.user_id;
			}
			this.__send(msg);
			this.__health();
		}
	}

	join() {
		this.__send({
			live_id: this.live_id,
			appversion: this.appVersion,
			retry: 0,
			reconnect: false,
			token: this.auth,
			event: "live_join",
			type: "live_req",
			useragent: "Web",
		});
	}

	disconnect() {
		this.isConnect = false;
		this.ws.close();
	}

	message(msg) {
		this.__send({
			message: msg.toString().replace(/\n/g, "\\n"),
			appversion: this.appVersion,
			useragent: "Web",
			token: this.auth,
			event: "live_message",
			type: "live_rpt",
		});
	}
}
