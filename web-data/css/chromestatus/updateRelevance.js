/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

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

	const data = JSON.parse(content).map(d => ({ name: d.property_name, relevance: Math.floor(d.day_percentage * 100)}));
	const outData = `module.exports = ${JSON.stringify(data, null, '\t')};`;
	fs.writeFileSync(path.join(__dirname, 'attributeRelevance.js'), outData);

	console.log(`Updated attributesRanking.js`);
}

main();


