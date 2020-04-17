import fs from 'fs';
import crypto from 'crypto';
import path from 'path';

const shaHash = str => crypto.createHash('sha256').update(str).digest('hex');

/**
 * @function getObject
 * @param {String} key
 * '.' 를 기준으로 key 하위 오브젝트를 한 번에 반환한다.
 */
const getObject = (obj, key, midx=0, rtn = obj) => {
	if ( Array.isArray(key) ) {
		if ( rtn === undefined || key.length-midx <= 0 ) {
			if ( key.length > 0 ) {
				return {d: rtn, k: key[0]};
			}
			return rtn;
		} else {
			rtn = rtn[key.shift()];
			if ( rtn === undefined ) {
				return undefined;
			}
		}
	} else if ( typeof key === "string" ) {
		key = key.split('.');
	}
	return getObject(obj, key, midx, rtn);
};

class Config {
	constructor(file) {
		this.cfgFile = file;
		this.hash = shaHash(path.basename(file));
		this.__loadConfigFile();
	}

	__encoding(str) {
		const cipher = crypto.createCipher('aes-256-cbc', this.hash);
		let result = cipher.update(str, 'utf8', 'base64');
		result += cipher.final('base64');
		return result;
	}

	__decoding(str) {
		const decipher = crypto.createDecipher('aes-256-cbc', this.hash);
		let result = decipher.update(str, 'base64', 'utf8');
		result += decipher.final('utf8');
		return result;
	}

	__loadConfigFile() {
		if ( fs.existsSync(this.cfgFile) ) {
			const cfgB64 = fs.readFileSync(this.cfgFile, { encoding: 'utf8' });
			const cfgStr = this.__decoding(cfgB64);
			this.cfg = JSON.parse(cfgStr);
		} else {
			this.cfg = {};
			//this.__saveConfigFile();
		}
		return this.cfg;
	}

	__saveConfigFile() {
		const cfgStr = JSON.stringify(this.cfg);
		const cfgB64 = this.__encoding(cfgStr);
		fs.writeFileSync(this.cfgFile, cfgB64, { encoding: 'utf8' });
		return;
	}

	set(key, value) {
		/*
		const o = getObject(this.cfg, key, 1);
		if ( typeof o === "object" ) {
			const { d, k } = o;
			d[k] = value;
			this.__saveConfigFile();
		}
		*/
		const sk = key.split('.');
		const _set = (obj, kidx = 0) => {
			if ( sk.length-1 === kidx ) {
				obj[sk[kidx]] = value;
				return;
			}

			if ( typeof obj[sk[kidx]] === "undefined" ) {
				obj[sk[kidx]] = {};
			}

			_set(obj[sk[kidx]], kidx+1);
		}
		_set(this.cfg, 0);
		this.__saveConfigFile();
	}

	get(key) {
		return getObject(this.cfg, key);
	}
}

export default {
	Config,
}
