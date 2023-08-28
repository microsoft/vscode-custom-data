/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

//@ts-check

const mdnData = require('mdn-data');
const mdnCompatData = require('@mdn/browser-compat-data');
const { abbreviateStatus } = require('./mdn-data-importer')
const { pseudoSelectorDescriptions, pseudoElementDescriptions, fetchDocFromMDN } = require('./mdn-documentation')

async function addMDNPseudoElements(vscPseudoElements) {
	const mdnSelectors = mdnData.css.selectors;
	const mdnCompatProperties = mdnCompatData.css.properties;
	const allPseudoElements = vscPseudoElements;

	const missingDocumentation = [];

	const allPseudoElementNames = vscPseudoElements.map(s => s.name);

	for (const selectorName of Object.keys(mdnSelectors)) {
		const selector = mdnSelectors[selectorName]
		if (selector.syntax.startsWith('::') && selector.syntax.length > 2) {
			if (
				!allPseudoElementNames.includes(selectorName) &&
				!allPseudoElementNames.includes(selectorName + '()')
			) {
				const desc = pseudoElementDescriptions[selectorName] || '';
				if (!desc) {
					missingDocumentation.push(selectorName);
				}
				allPseudoElements.push({
					name: selectorName,
					desc,
					status: abbreviateStatus(selector, mdnCompatProperties[selectorName])
				})
			}
		}
	}
	if (missingDocumentation.length) {
		const fetchedDocs = ['{'];
		console.log('add to mdn-documentation.ts (pseudoElementDescriptions):');
		for (let prop of missingDocumentation) {
		  const doc = await fetchDocFromMDN(prop.replace(/::/, '_doublecolon_'), undefined);
		  fetchedDocs.push(`  '${prop}': \`${doc ?? ''}\`,`);
		}
		fetchedDocs.push('}');
		console.log(fetchedDocs.join('\n'));
	}

	return allPseudoElements
}

const mdnExcludedPseudoSelectors = [
	/**
	 * See https://developer.mozilla.org/en-US/docs/Web/CSS/:matches
	 * -moz-any and -webkit-any are already in css-schema.json
	 */
	':any'
]

async function addMDNPseudoSelectors(vscPseudoClasses) {
	const mdnSelectors = mdnData.css.selectors;
	const mdnCompatProperties = mdnCompatData.css.properties;
	const allPseudoSelectors = vscPseudoClasses

	const allPseudoSelectorNames = vscPseudoClasses.map(s => s.name);

	const missingDocumentation = [];

	for (const selectorName of Object.keys(mdnSelectors)) {
		const selector = mdnSelectors[selectorName]
		if (selector.syntax.startsWith(':') && !selector.syntax.startsWith('::') && selector.syntax.length > 1) {
			if (
				!mdnExcludedPseudoSelectors.includes(selectorName) &&
				!allPseudoSelectorNames.includes(selectorName) &&
				!allPseudoSelectorNames.includes(selectorName + '()')
			) {
				
				const desc = pseudoSelectorDescriptions[selectorName] ||  '';
				if (!desc) {
					missingDocumentation.push(selectorName);
				}

				allPseudoSelectors.push({
					name: selectorName,
					desc,
					status: abbreviateStatus(selector, mdnCompatProperties[selectorName])
				})
			}
		}
	}
	if (missingDocumentation.length) {
		console.log('add to mdn-documentation.ts (pseudoSelectorDescriptions):');
		const fetchedDocs = ['{'];
		for (let prop of missingDocumentation) {
			const doc = await fetchDocFromMDN(prop.replace(/:/, '_colon_'), undefined);
			fetchedDocs.push(`  '${prop}': \`${doc ?? ''}\`,`);
		  }
		  fetchedDocs.push('}');
		  console.log(fetchedDocs.join('\n'));
	}

	return allPseudoSelectors
}

module.exports = {
	addMDNPseudoElements,
	addMDNPseudoSelectors
}
