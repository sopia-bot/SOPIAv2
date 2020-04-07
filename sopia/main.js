// main.js

//"!개발자" 이런 문장이 왔을 때, 감지를 해내고
//!를 삭제하여 "개발자"로 만듦
exports.isCmd = (e) => {
    let msg = e.message;
    if ( msg.indexOf("!") === 0 ) {
        msg = msg.replace("!", ""); // ! 삭제
        e.message = msg;
        e.cmd = msg.split(' ')[0];
        e.isCmd = true;
        e.content = msg.replace(e.cmd, "");
        return true;
    }
    return false;
};


exports.isAdmin = (author = "") => {
	/*
    let a = sopia.storage.get('admins');
    if ( a.indexOf(author.tag) !== -1 ) {
        return true; //참/거짓 할때의 참.
    }
	*/
    if ( Array.isArray(live.manager_ids) && live.manager_ids.includes(author.id) ) {
        return true;
    }

    if ( live && live.author.id == author.id ) {
        return true;
    }

    return false;
};

exports.runCmd = (cmd, e) => {
    let str = "";
    switch ( typeof cmd ) {
        case "string": {
            str = cmd;
        } break;
        case "function": {
            str = cmd(e);
        } break;
        case "object": {
            if ( Array.isArray(cmd) ) {
                let result = Math.floor(Math.random() * cmd.length);
                switch ( typeof cmd[result] ) {
                    case "string": {
                        str = cmd[result];
                    } break;
                    case "function": {
                        str = cmd[result](e);
                    }
                }
            }
        } break;
    }
    return str;
};
