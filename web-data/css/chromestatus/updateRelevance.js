/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

const fs = require('fs');
const path = require('path');
const util = require('../utils');

async function main() {
	const content = await util.download(`https://chromestatus.com/data/csspopularity`);

	const data = JSON.parse(content).map(d => ({ name: d.property_name, relevance: Math.floor(d.day_percentage * 100)}));
	const outData = `module.exports = ${JSON.stringify(data, null, '\t')};`;
	fs.writeFileSync(path.join(__dirname, 'attributeRelevance.js'), outData);

	console.log(`Updated attributesRanking.js`);
}

main();


