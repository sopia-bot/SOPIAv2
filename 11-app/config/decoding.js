const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const argv = process.argv.splice(2);

const shaHash = str => crypto.createHash('sha256').update(str).digest('hex');



const decoding = (str, hash) => {
	const decipher = crypto.createDecipher('aes-256-cbc', hash);
	let result = decipher.update(str, 'base64', 'utf8');
	result += decipher.final('utf8');
	return result;
}

argv.forEach((arg) => {
	let target = arg;
	if ( !fs.existsSync(target) ) {
		target = path.join(__dirname, arg);
	}

	if ( fs.existsSync(target) ) {
		console.log("=============================", arg,"=============================");
		const hash = shaHash(path.basename(arg));
		const str = fs.readFileSync(target, { encoding: 'utf8' });
		const decryptStr = decoding(str, hash);
		console.log(decryptStr);
		console.log("");
	} else {
		console.error("파일 ", arg, "를 찾을 수 없습니다.");
	}
});
