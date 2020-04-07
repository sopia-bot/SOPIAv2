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
			Object.keys(commands[spoon.live.author.tag]).forEach((k) => {
				cmd.push(k);
			});
			return cmd.join(", ");
		}
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
