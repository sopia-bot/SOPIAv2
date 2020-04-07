if ( !isAdmin(spoon.author.id) ) return;

const commands = {
	// 특정 DJ 방송의 명령어
	"02x26n": {
		"윤군": "이 방송의 DJ 이죠. 명령어를 친 당신은 매니저 이상의 권한자고요.",
		// 없는 항목은 default 적용
	},
	// 모든 방송에서 공통 리액션
	"default": {
		//업타임에서 평균 15초 딜레이가 있다
		"업타임": e => makePlaybar(parseInt((new Date().getTime() - sopia.var.created.getTime()) / 1000), 7200),
		"off": (e) => {
			sopia.send("소피아의 동작이 중지됩니다.\n!on 명령을 사용하여 킬 수 있습니다.");
			sopia.isRun = false;
		},
		"on": (e) => {
			if ( sopia.var._send_ ) {
				sopia.send = sopia.var._send_;
			}
			sopia.send("소피아가 동작합니다.\n!off 명령어를 사용하여 종료할 수 있습니다.");
			sopia.isRun = true;
		},
	}
}

const djTag = spoon.live.author.tag;
const authorTag = spoon.author.tag;

if ( isCmd(spoon) ) {
	let send = "";
	if ( commands[djTag] ) {
		send = runCmd(commands[djTag][spoon.cmd], spoon);
	}

	if ( send && send.trim() === "" ) {
		send = runCmd(commands["default"][spoon.cmd], spoon);
	}

	if ( send && send.trim().length > 0 ) {
		sopia.send(send);
	}
}
