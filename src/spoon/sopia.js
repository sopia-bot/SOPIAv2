// native import
import path from 'path';
import fs from 'fs';

// package import
import axios from 'axios';
import { remote } from 'electron';

// plugins import
import c from '@/plugins/config.js';


// global variable
const Config = c.Config;
const { app } = remote;

const cfg = new Config(path.join(app.getPath('userData'), 'config.json'));
window.cfg = cfg;

const itv = {
    add: function(key, func, time) {
        if (this[key]) {
            return false;
        }
        this[key] = {
            f: func,
            t: time,
            itv: setInterval(func, time)
        };
    },
    clear: function(key) {
        if ( this[key] ) {
            clearInterval(this[key].itv);
            delete this[key];
        }
    },
    reload: function(key) {
        if ( this[key] ) {
            clearInterval(this[key].itv);
            this[key].itv = setInterval(this[key].f, this[key].t);
        }
    },
};

const getPath = (str) => path.join(app.getPath('userData'), str);

let apiKey = "";
let getApiKeyMutex = false;
const getApiKey = () => {
    if ( getApiKeyMutex ) return;
    getApiKeyMutex = true;
    axios.get('https://sopia-bot.firebaseio.com/11-app/plugins/speech/api-key.json')
        .then(res => {
            apiKey = res.data;
        })
        .finally(() => {
            getApiKeyMutex = false;
        });
}

const voices = {
    "minji": {languageCode: 'ko-KR', name: 'ko-KR-Wavenet-A', ssmlGender: 'FEMALE'},
    "minjung": {languageCode: 'ko-KR', name: 'ko-KR-Wavenet-B', ssmlGender: 'FEMALE'},
    "minsu": {languageCode: 'ko-KR', name: 'ko-KR-Wavenet-C', ssmlGender: 'MALE'},
    "minsang": {languageCode: 'ko-KR', name: 'ko-KR-Wavenet-D', ssmlGender: 'MALE'}
};

String.prototype.toB64Str = function() {
	let buf = this;
	return "data:audio/mp3;base64," + buf.toString('base64');
};
Buffer.prototype.toB64Str = function() {
	let buf = this;
	return "data:audio/mp3;base64," + buf.toString('base64');
};


const read = (str, type = "minji") => {
    return new Promise((resolve, reject) => {
        if ( !str ) {
            reject(new Error('str is undefined'));
        }
    
        if ( type === "random" ) {
            let voiceList = Object.keys(voices);
            let idx = Math.floor(Math.random() * (voiceList.length));

            type = voiceList[idx];
        }

        axios({
            url: `https://texttospeech.googleapis.com/v1/text:synthesize`,
            params: {
                key: 'AIzaSyDFO532YHybItji1i7ZhhDQWDWCir3kRFY',
                alt: 'json',
            },
            method: 'post',
            data: {
                "input": {
                    "text": str,
                },
                "voice": voices[type],
                "audioConfig": {
                    "audioEncoding": 'MP3',
                },
            },
        }).then(res => {
            if ( res ) {
                if ( res.data ) {
                    if ( res.data.audioContent ) {
                        resolve(res.data.audioContent.toB64Str());
                    } else {
                        reject(new Error('invalid audioContent'));
                    }
                } else {
                    reject(new Error('invalid res data'));
                }
            } else {
                reject(new Error('invalid axios response'));
            }
        }).catch(reject);
    });
}

const ttsMessgeWrapper = (str) => {
	return str.toString().
		replace(/\\/g, "").
		replace(/\./g, "").
		replace(/\+/g, "+").
		replace(/\n/g, " ").
		replace(/\ /g, "");
};

const parser = (tts = "", signature = []) => {
	if ( signature.length <= 0 ) return [ tts ];

	tts = ttsMessgeWrapper(tts);

	let reStr = "(";
	signature.forEach((s) => {
		let or = "";
		if ( reStr.length > 1 ) {
			or = "|";
		}
		reStr += `${or}${s.replace(/(\(|\))/g, "\\$1")}`;
	});
	reStr += ")";

	//sopia.debug("tts signature parser", reStr);
	const re = new RegExp(reStr);
	return tts.split(re);
};

const tts = {
    user: [],
    stack: [],
    isrun: false,
    stop: null,
};

///////////////////////////////////////////////////////////////////
//                        spoor chat loop                        //
///////////////////////////////////////////////////////////////////
itv.add('spoorchat', () => {
	// tick check
	tts.user.forEach((t, idx) => {
		if ( t.tick++ > cfg.get('spoor.toutspoor') ) {
			const deletedItem = tts.user.splice(idx, 1); // delete
		}
	});

	if ( tts.stack.length > 0 ) {
		// mutex
		if ( tts.isrun ) return;

		// play tts
		tts.isrun = true;

		const chatData = tts.stack.shift();
		//sopia.debug("============= Spoor Chat =============");
		fs.readFile(getPath('/media/SpoorChatNoti.mp3'), { encoding: 'base64' }, (err, data) => {
			if ( err ) {
				console.error(err);
				sopia.tts.isrun = false;
				return;
			}

			let voiceType = cfg.get('spoor.type');
			const notiSnd = new Audio(data.toB64Str());
			notiSnd.volume = (cfg.get('spoor.effectvolume') * 0.01);
			notiSnd.onpause = function() {
                const signatures = cfg.get('spoor.signature');
				const sigKeys = Object.keys(signatures);
				const argv = parser(chatData.message, sigKeys);
				const readStack = new Array(argv.length);
				//sopia.debug(argv);
				
				if ( Array.isArray(argv) ) {
					// make sound array
					argv.forEach((arg, idx) => {
						let sigFile = signatures[arg];
						if ( sigFile ) {
							// has signature
							//sopia.debug("signature! ", sigFile);
							const buf = fs.readFileSync(sigFile);
							if ( path.extname(sigFile) === '.base64' ) {
								readStack[idx] = buf.toString('utf8');
							} else {
								readStack[idx] = buf.toB64Str();
							}
						} else {
							if ( arg.trim() !== "" ) {
								//sopia.debug("Run tts", arg.trim());


								read(arg.trim(), voiceType).then(buf => {
									if ( !readStack.includes(buf) ) {
										readStack[idx] = buf;
									} else {
										// 이전과 동일한 tts로 나올 시 1회만 더 실행
										//sopia.debug("I find matched file. 1 time retry. idx", idx);
										read(arg.trim(), voiceType).then(buf => {
											//sopia.debug("success get buf. idx", idx);
											readStack[idx] = buf;
										});
									}
								});
							} else {
								readStack[idx] = "no run";
							}
						}
                    });
                    
                    const ttsVolume = cfg.get('spoor.ttsvolume');

					// read all array
					let speechRun = false;
					let noRuned = false;
                    let speechIdx = 0;
					let speechItv = setInterval(() => {
						if (  speechRun === false ) {
							speechRun = true; // mutex
							if ( speechIdx < readStack.length ) {
								if ( readStack[speechIdx] === "no run" ) {
									noRuned = true;
									speechRun = false;
									speechIdx++;
								} else if ( readStack[speechIdx] ) {
									let b64snd = readStack[speechIdx];
									let spoorChatSnd = new Audio(b64snd);
									spoorChatSnd.onpause = () => {
										speechRun = false;
										speechIdx++;
										spoorChatSnd.remove();
									};
									spoorChatSnd.volume = (ttsVolume * 0.01);
									spoorChatSnd.play();

									tts.stop = () => {
										readStack.splice(0, readStack.length);
										spoorChatSnd.pause();
									};
								} else {
									speechRun = false;
									if ( noRuned && !readStack[speechIdx] ) {
										noRuned = false;
										speechIdx++;
									}
								}
							} else {
								clearInterval(speechItv);
								tts.isrun = false;
								readStack.splice(0, readStack.length);
								tts.stop = null;
								//sopia.debug('speech finish');
							}
						}
					}, 100); // thick 1ms
				}

				notiSnd.remove();
			};
			notiSnd.play();
		});

		// spoor logging
		// replay가 아니라면 추가.
		if ( !chatData.replay ) {
			if ( typeof spoorLog === 'function' ) {
				spoorLog(chatData);
			}
		}
	}
}, 1000);

const pushTtsList = (data) => {
	// spoorchat
	// console.log("pushTtsList come!!!!!!!!!!!!!!!!!");
	let idx = tts.user.findIndex(item => item.id === data.author.id);
	if ( idx >= 0 ) {
		tts.user.splice(idx, 1);
		// console.log("idx is", idx, "message is", data.message);
		tts.stack.push({
			message: data.message,
		});
	}
};

const pushUser = (author) => {
	// console.log("pushUser", author);
	tts.user.push({ id: author.id, thick: 0});
}


export default {
    itv,
	pushTtsList,
	pushUser,
	voices,
	tts,
};