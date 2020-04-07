// DJ 방마다 다른 리액션
switch ( spoon.live.author.tag ) {
	case "02x26n":
		sopia.send(`${spoon.author.nickname} 님이 윤군의 방송에다가 좋아요를 눌러버렸네용 오홍홍.`);
		break;
	default: // 그 외 다른 방송
		// 입장한 사람마다 다른 리액션
		switch ( spoon.author.tag ) {
			case "02x26n":
				sopia.send("윤군님이 좋아요를 눌렀습니다.");
				break;
			default: // 그 외 다른 사람
				sopia.send(`${spoon.author.nickname} 님이 좋아요를 누르셨습니다.`);
				break;
		}
		break;
}
