const reaction = {
	// 특정 DJ 방송의 리액션
	"02x26n": {
		"sticker_snack11": e => `${e.author.nickname} 님이 윤군의 방송에서 11스푼을 선물하셨습니다.`,
		// 없는 항목은 default 적용
	},
	// 모든 방송에서 공통 리액션
	"default": {
		"sticker_like": e => `${e.author.nickname} 님이 좋아요 10개를 선물하셨습니다.`,
		"sticker_juice": null,
		"sticker_icecream": null,
		"sticker_coke": null,
		"sticker_rose": null,
		"sticker_clap": null,
		"sticker_bubbletea": null,
		"sticker_snack11": null,
		"sticker_potatochip": null,
		"sticker_hotdog": null,
		"sticker_hamburger": null,
		"sticker_lip": null,
		"sticker_coffee_donut": null,
		"sticker_chicken": null,
		"sticker_cake": null,
		"sticker_crown": null,
		"sticker_pizza": null,
		"sticker_myheart": null,
		"sticker_bearflower": null,
		"sticker_vday": null,
		"sticker_clover": null,
		"sticker_ohohoh": null,
		"sticker_jackpot": null,
		"sticker_angel": null,
		"sticker_santa": null,
		"sticker_airplane": null,
		"default": e => `${e.author.nickname}님이 스푼 ${e.amount * e.combo}개를 선물하셨습니다.`
	}
}

const djTag = spoon.live.author.tag;
const authorTag = spoon.author.tag;
const sticker = spoon.sticker;
let send = "";
if ( reaction[djTag] ) {
	if ( reaction[djTag][sticker] ) {
		send = runCmd(reaction[djTag][sticker], spoon);
	}
}

if ( send && send.trim() === "" ) {
	let s = reaction["default"][sticker] ? sticker : "default";
	send = runCmd(reaction["default"][s], spoon);
}

if ( send && send.trim().length > 0 ) {
	live.message(send);
}
