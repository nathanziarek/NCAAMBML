var request = require('request');
var fs = require('fs-extra');
var md5 = require('md5');

module.exports = function requestAndCache(url, cb, skipOnCache = false) {
	var file = './cache/' + md5(url) + '.json';

	fs.pathExists(file, (err, exists) => {
		if (!exists) {
			request(url, (error, response, body) => {
				if (!error) {
					console.log('   ...caching');
					fs.ensureFileSync(file);
					fs.writeJson(
						file,
						{
							error: error,
							response: response,
							body: body
						},
						err => {
							cb && cb(error, response, body);
						}
					);
				} else {
					cb && cb(error, response, body);
				}
			});
		} else {
			console.log('   ...using cache');
			if (skipOnCache) {
				cb && cb(null, null, '');
			} else {
				fs.readJson(file, (err, obj) => {
					cb && cb(obj.error, obj.response, obj.body);
				});
			}
		}
	});
};
