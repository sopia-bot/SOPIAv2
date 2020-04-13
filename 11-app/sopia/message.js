String.prototype.replaceAt=function(index, replacement) {
	return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
};

String.prototype.sprintf = function() {
	let format = this;
	
	for (let i = 0;i < arguments.length;i++) {
		let element = arguments[i];
		format = format.replace(`{${i}}`, element);
	};
	return format;
};

//초 단위
const s2hms = (s) => {
	let h = (parseInt(s/3600)).toString();
	let m = (parseInt((s - (h*3600)) / 60)).toString();
	let sc = (parseInt((s - (h*3600) - (m*60)))).toString();
	
	if ( h.length < 2 ) {
		h = '0' + h;
	}
	if ( m.length < 2 ) {
		m = '0' + m;
	}
	if ( sc.length < 2 ) {
		sc = '0' + sc;
	}
	
	return {
		h: h,
		m: m,
		s: sc
	};
};

const makePlaybar = (current, max) => {
	const playbar = 
	'{0} {1} {2}\n'+
	'     ㅤㅤㅤㅤㅤ ◁ㅤㅤ❚❚ㅤㅤ▷ㅤㅤㅤㅤㅤ↻ ⇆';
	const bar = '────────────';
	const parseCurrent = s2hms(current);
	const parseMax = s2hms(max);
	
	const per = parseInt(current / max * 100);
	const idx = parseInt(bar.length * per / 100);
	
	
	return playbar.sprintf(`${parseCurrent.h}:${parseCurrent.m}:${parseCurrent.s}`,
	bar.replaceAt(idx, '●'),
	`${parseMax.h}:${parseMax.m}:${parseMax.s}`);
};


const commands = {
	// 특정 DJ 방송의 명령어
	"02x26n": {
		"윤군": "이 방송의 DJ 이죠.",
		// 없는 항목은 default 적용
	},
	// 모든 방송에서 공통 리액션
	"default": {
		"바보": e => `나는 ${e.author.nickname}님 밖에 모르는 바보~`,
		"나이": "SOPIA는 2019년 6월 20일 프로젝트가 생성되었습니다.",
		"개발자": "소피아의 아빠는 개발자 윤군입니다.",
		"명령어": e => {
			const cmds = [];
			if ( commands[spoon.live.author.tag] ) {
				Object.keys(commands[spoon.live.author.tag]).forEach((k) => {
					cmds.push(k);
				});
			}
			Object.keys(commands['default']).forEach((k) => {
				cmds.push(k);
			});
			return cmds.join(", ");
		}
	}
};

// 관리자 명령어
const pmCmds = {
	// 특정 DJ 방송의 명령어
	"02x26n": {
		"윤군": "이 방송의 DJ 이죠. 명령어를 친 당신은 매니저 이상의 권한자고요.",
		// 없는 항목은 default 적용
	},
	// 모든 방송에서 공통 리액션
	"default": {
		//업타임에서 평균 15초 딜레이가 있다
		"업타임": e => makePlaybar(parseInt((new Date().getTime() - new Date(live.info.created).getTime()) / 1000), 7200),
		"off": (e) => {
			sopia.isRun = false;
			return "소피아의 동작이 중지됩니다.\n!on 명령을 사용하여 킬 수 있습니다.";
		},
		"on": (e) => {
			sopia.isRun = true;
			return "소피아가 동작합니다.\n!off 명령어를 사용하여 종료할 수 있습니다.";
		},
	}
}

const djTag = live.info.author.tag;
const authorTag = spoon.author.tag;

const sendCheck = str => (!str || str.trim().length === 0 );

if ( isCmd(spoon) ) {
	let send = "";

	if ( isAdmin(spoon.author) ) {
		if ( pmCmds[djTag] ) {
			send = runCmd(pmCmds[djTag][spoon.cmd], spoon);
		}

		if ( sendCheck(send) ) {
			send = runCmd(pmCmds["default"][spoon.cmd], spoon);
		}
	}

	if ( sendCheck(send) && commands[djTag] ) {
		send = runCmd(commands[djTag][spoon.cmd], spoon);
	}

	if ( sendCheck(send) ) {
		send = runCmd(commands["default"][spoon.cmd], spoon);
	}

	if ( !sendCheck(send) ) {
		live.message(send);
	}
}
