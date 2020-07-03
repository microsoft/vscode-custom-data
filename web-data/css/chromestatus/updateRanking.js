/**
 * Instructions:
 * 
 * - Open https://www.chromestatus.com/metrics/css/popularity
 * - Run this snippet in its console
 * - Data in JSON will be in your clipboard
 * - Paste that into `attributesRanking.json`
 */
var https = require('https');
var fs = require('fs');
var path = require('path');
var url = require('url');

function download(source) {
	return new Promise((c, e) => {
		let _url = url.parse(source);
		let options = { host: _url.host, port: _url.port, path: _url.path, headers: { 'User-Agent': 'NodeJS' } };
		let content = '';
		https.get(options, function (response) {
			response.on('data', function (data) {
				content += data.toString();
			}).on('end', function () {
				c(content);
			});
		}).on('error', function (err) {
			e(err.message);
		});
	});
}

async function main() {
	const content = await download(`https://www.chromestatus.com/data/csspopularity`);

	const data = JSON.parse(content).map(d => d.property_name);
	const outData = `module.exports = ${JSON.stringify(data, null, '\t')};`;
	fs.writeFileSync(path.join(__dirname, 'attributesRanking.js'), outData);

	console.log(`Updated attributesRanking.js`);
}

main();


