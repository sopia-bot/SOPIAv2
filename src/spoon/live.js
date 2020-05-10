// native modules
import path from 'path';
import fs from 'fs';

// package modules
import electron from 'electron';

import logger from '@/plugins/logger.js';

// global variable
const { remote } = electron;
const { app } = remote;

const ud = (src) => path.join(app.getPath('userData'), src);

const dateYYYYMMDD = () => {
	const date = new Date();
	const year = date.getFullYear().toString().padStart(0, 4);
	const month = (date.getMonth()+1).toString().padStart(0, 2);
	const day = date.getDate().toString().padStart(0, 2);
	return `${year}${month}${day}`;
}

export default class Live {
	constructor(live_id, config = {}, wsServer) {
		this.live_id = live_id.toString();
		this.auth = "";
		this.appVersion = "4.1.16";
		this.wsServer = wsServer || "wss://heimdallr.spooncast.net";
		this.isConnect = false;
		this.healthIntTerm = 30;

		this.onItem = {};
		this.onceItem = {};
		this.overonItem = {};

		// save chat
		this.isSaveChat = false;
		this.saveFile = '';

		this.info = {};
		this.msgs = [];

		const keys = Object.keys(config);
		keys.forEach(k => {
			this[k] = config[k];
		});

		logger.debug('live', `${live_id} 라이브 클래스가 생성되었습니다.`);
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

	get liveUrl() {
		return `https://spooncast.net/${this.country}/live/${this.live_id}`;
	}

	set onmessage(callback = () => {}) {
		this.onmsgcb = callback;
	}

	set onclose(callback = () => {}) {
		this.ws.onclose = callback;
	}

	on(key, func) {
		if ( typeof this.onItem[key] === "object" && Array.isArray(this.onItem[key]) ) {
			this.onItem[key].push(func);
		} else {
			this.onItem[key] = [
				func,
			];
		}
	}

	once(key, func) {
		if ( typeof this.onceItem[key] === "object" && Array.isArray(this.onceItem[key]) ) {
			this.onceItem[key].push(func);
		} else {
			this.onceItem[key] = [
				func,
			];
		}
	}

	overon(key, func) {
		this.overonItem[key] = func;
	}

	emit(key, ...data) {
		if ( typeof this.onItem[key] === "object" && Array.isArray(this.onItem[key]) ) {
			this.onItem[key].forEach(func => {
				if ( typeof func === "function" ) {
					func(...data);
				}
			});
		}
		if ( typeof this.onceItem[key] === "object" && Array.isArray(this.onceItem[key]) ) {
			this.onceItem[key].forEach(func => {
				if ( typeof func === "function" ) {
					func(...data);
				}
			});
			this.onceItem[key] = [];
		}
		if ( typeof this.overonItem[key] === "function" ) {
			this.overonItem[key](...data);
		}
	}

	connect() {
		if ( this.isConnect ) {
			return false;
		}

		this.ws = new WebSocket(`${this.wsServer}/${this.live_id}`);
		this.ws.onmessage = (msg) => {
			const e = JSON.parse(msg.data);
			const time = new Date();

			// dashboard admins infomation
			if ( ["live_update", "live_leave"].includes(e.event) ) {
				this.info = e.data.live;
				this.emit('admin-info', this.info);
			}

			// save chat
			if ( this.isSaveChat ) {
				if (  e.event === "live_message" ) {
					const nickname = e.data.author.nickname;
					fs.appendFile(this.saveFile, `[${nickname}][${time.toLocaleTimeString()}] ${e.data.message}\n`, {encoding: 'utf8'}, (err) => {
						if (err) {
							logger.error(err);
						}
					});
				}
			}

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

			logger.debug('live', `방송 웹 소켓에 성공적으로 연결했습니다.`);
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
		logger.debug('live', `${this.live_id} 방송에 대한 웹 소켓 연결을 해제합니다.`);
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

	startSaveChat() {
		if ( !this.isSaveChat ) {
			const chatLogFolder = ud('chat-logs');
			if ( !fs.existsSync(chatLogFolder) ) {
				fs.mkdirSync(chatLogFolder);
			}

			const time = dateYYYYMMDD();
			this.saveFile = path.join(chatLogFolder, `${time}-${this.info.id}.log`);
			
			fs.writeFile(this.saveFile, `${new Date(this.info.created).toLocaleTimeString()} 에 만들어진 라이브의 채팅 로그입니다.\n\n`, { encoding: 'utf8' }, (err) => {
				if ( err ) { 
					logger.error(err);
				}
			});
			this.isSaveChat = true;
			logger.info('live', '세이브 파일 저장을 시작합니다.');
		}
	}

	stopSaveChat() {
		if ( this.isSaveChat ){
			logger.info('live', '세이브 파일 저장을 종료합니다.');
			this.isSaveChat = false;
		}
	}
}
