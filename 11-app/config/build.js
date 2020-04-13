const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const argv = process.argv.splice(2);

const shaHash = str => crypto.createHash('sha256').update(str).digest('hex');

const encoding = (str, hash) => {
	const cipher = crypto.createCipher('aes-256-cbc', hash);
	let result = cipher.update(str, 'utf8', 'base64');
	result += cipher.final('base64');
	return result;
}

const writeOutput = (target, str) => {
	if ( !fs.existsSync('./output') ) {
		fs.mkdirSync('./output');
	}
	const dir = path.dirname(target);
	const file = path.basename(target);
	const outputDir = path.join(dir, 'output');
	const outputFile = path.join(outputDir, file);
	fs.writeFileSync(outputFile, str, {encoding: 'utf8'});
};

argv.forEach((arg) => {
	const target = path.join(__dirname, arg);
	if ( fs.existsSync(target) ) {
		const hash = shaHash(path.basename(arg));
		fs.readFile(target, { encoding: 'utf8' }, (err, str) => {
			if ( err ) {
				throw err;
			}
			const encryptStr = encoding(str, hash);
			writeOutput(target, encryptStr);
		});
	} else {
		console.error("파일 ", arg, "를 찾을 수 없습니다.");
	}
});