import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import fs from 'fs';
import * as util from '../utils.mjs';

async function main() {
	const content = await util.download(`https://chromestatus.com/data/csspopularity`);

	const data = JSON.parse(content).map(d => ({ name: d.property_name, relevance: Math.floor(d.day_percentage * 100)}));
	const outData = `export default ${JSON.stringify(data, null, '\t')};`;
	fs.writeFileSync(join(__dirname, 'attributeRelevance.mjs'), outData);

	console.log(`Updated attributeRelevance.mjs`);
}

main();


