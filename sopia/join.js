// DJ 방마다 다른 리액션
switch ( spoon.live.author.tag ) {
	case "02x26n":
		sopia.send(`${spoon.author.nickname} 님이 윤군의 방송에 입장했습니다.`);
		break;
	default: // 그 외 다른 방송
		// 입장한 사람마다 다른 리액션
		switch ( spoon.author.tag ) {
			case "02x26n":
				sopia.send("어서오십시오. 주인님.");
				break;
			default: // 그 외 다른 사람
				sopia.send(`${spoon.author.nickname} 님 어서오십시오.`);
				break;
		}
		break;
}
