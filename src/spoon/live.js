export default class Live {
	constructor(live_id, config = {}, wsServer) {
		this.live_id = live_id;
		this.auth = config.auth || "";
		this.appVersion = config.appVersion || "4.1.16";
		this.wsServer = wsServer || "wss://heimdallr.spooncast.net";
		this.isConnect = false;
		this.healthIntTerm = config.healthIntTerm || 30;
	}

	__health() {
		this.ws.send(
			JSON.stringify({
				appversion:this.appVersion,
				event:"live_health",
				live_id:this.live_id,
				type:"live_rpt",
				useragent:"Web",
			})
		);
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
			if ( e.event === "live_join" ) {
				const data = e.data;
				if ( data ) {
					const live = data.live;
					if ( live.close_status === 1 ) {
						this.ws.close();
						throw new Error('Is closed live');
					} else {
						this.healthInterval = setInterval(() => {
							this.__health();
						}, (this.healthIntTerm * 1000));
						this.isConnect = true;
					}
				}
			}

			if ( typeof this.onmsgcb === "function" ) {
				this.onmsgcb(msg);
			}
		};
		this.ws.onopen = () => {
			this.ws.send(
				JSON.stringify({
					appversion:this.appVersion,
					event:"live_join",
					live_id:this.live_id,
					reconnect:false,
					retry:0,
					type:"live_req",
					useragent:"Web",
				})
			);
			this.__health();
		}
	}

	disconnect() {
		this.isConnect = false;
		this.ws.close();
	}
}
