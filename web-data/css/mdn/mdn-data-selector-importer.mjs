/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

//@ts-check

import mdnData from 'mdn-data';
import mdnCompatData from '@mdn/browser-compat-data' with { type: 'json' };
import { abbreviateStatus } from './mdn-data-importer.mjs';
import { pseudoSelectorDescriptions, pseudoElementDescriptions, fetchDocFromMDN, atDirectiveDescriptions, atDirectiveDescriptorDescriptions } from './mdn-documentation.mjs';

export async function addMDNPseudoElements(vscPseudoElements) {
	const mdnSelectors = mdnData.css.selectors;
	const mdnCompatProperties = mdnCompatData.css.properties;
	const allPseudoElements = vscPseudoElements;

	const missingDocumentation = [];

	const allPseudoElementNames = vscPseudoElements.map(s => s.name);

	for (const selectorName of Object.keys(mdnSelectors)) {
		const selector = mdnSelectors[selectorName];
		if (selector.syntax.startsWith('::') && selector.syntax.length > 2) {
			if (
				!allPseudoElementNames.includes(selectorName) &&
				!allPseudoElementNames.includes(selectorName + '()')
			) {
				const description = pseudoElementDescriptions[selectorName] || '';
				if (!description) {
					missingDocumentation.push(selectorName);
				}
				allPseudoElements.push({
					name: selectorName,
					description,
					status: abbreviateStatus(selector, mdnCompatProperties[selectorName])
				});
			}
		}
	}
	if (missingDocumentation.length) {
		const fetchedDocs = ['{'];
		console.log('add to mdn-documentation.mjs (pseudoElementDescriptions):');
		for (let prop of missingDocumentation) {
			const doc = await fetchDocFromMDN(prop.replace(/::/, '_doublecolon_'), undefined);
			fetchedDocs.push(`  '${prop}': \`${doc ?? ''}\`,`);
		}
		fetchedDocs.push('}');
		console.log(fetchedDocs.join('\n'));
	}

	return allPseudoElements;
}

const mdnExcludedPseudoSelectors = [
	/**
	 * See https://developer.mozilla.org/en-US/docs/Web/CSS/:matches
	 * -moz-any and -webkit-any are already in css-schema.json
	 */
	':any'
];

export async function addMDNPseudoSelectors(vscPseudoClasses) {
	const mdnSelectors = mdnData.css.selectors;
	const mdnCompatProperties = mdnCompatData.css.properties;
	const allPseudoSelectors = vscPseudoClasses;

	const allPseudoSelectorNames = vscPseudoClasses.map(s => s.name);

	const missingDocumentation = [];

	for (const selectorName of Object.keys(mdnSelectors)) {
		const selector = mdnSelectors[selectorName];
		if (selector.syntax.startsWith(':') && !selector.syntax.startsWith('::') && selector.syntax.length > 1) {
			if (
				!mdnExcludedPseudoSelectors.includes(selectorName) &&
				!allPseudoSelectorNames.includes(selectorName) &&
				!allPseudoSelectorNames.includes(selectorName + '()')
			) {
				const description = pseudoSelectorDescriptions[selectorName] || '';
				if (!description) {
					missingDocumentation.push(selectorName);
				}

				allPseudoSelectors.push({
					name: selectorName,
					description,
					status: abbreviateStatus(selector, mdnCompatProperties[selectorName])
				});
			}
		}
	}
	if (missingDocumentation.length) {
		console.log('add to mdn-documentation.mjs (pseudoSelectorDescriptions):');
		const fetchedDocs = ['{'];
		for (let prop of missingDocumentation) {
			const doc = await fetchDocFromMDN(prop.replace(/:/, '_colon_'), undefined);
			fetchedDocs.push(`  '${prop}': \`${doc ?? ''}\`,`);
		}
		fetchedDocs.push('}');
		console.log(fetchedDocs.join('\n'));
	}

	return allPseudoSelectors;
}

export async function addMDNAtDirectives(atDirectives) {
	const mdnAtRules = mdnData.css.atRules;
	const allAtDirectives = atDirectives;
	const allAtDirectiveNames = atDirectives.map(s => s.name);
	const missingDocumentation = [];

	for (const name of Object.keys(mdnAtRules)) {
		if (!allAtDirectiveNames.includes(name)) {
			const description = atDirectiveDescriptions[name] || '';
			if (!description) {
				missingDocumentation.push(name);
			}

			allAtDirectives.push({
				name: name,
				description,
				browsers: undefined
			});
		}
	}

	if (missingDocumentation.length) {
		console.log('add to mdn-documentation.mjs (atDirectiveDescriptions):');
		const fetchedDocs = ['{'];
		for (let prop of missingDocumentation) {
			const doc = await fetchDocFromMDN(prop.replace(/:/, '_colon_'), undefined);
			fetchedDocs.push(`  '${prop}': \`${doc ?? ''}\`,`);
		}
		fetchedDocs.push('}');
		console.log(fetchedDocs.join('\n'));
	}

	for (const directive of allAtDirectives) {
		const missingDocumentation = [];
		if (directive.descriptors) {
			const descriptorDescriptions = atDirectiveDescriptorDescriptions[directive.name] || {}
			for (const descriptor of directive.descriptors) {
				const description = descriptorDescriptions[descriptor.name]
				if (description !== undefined) {
					descriptor.description = description
				} else {
					missingDocumentation.push(descriptor.name)
				}
			}
		}

		if (missingDocumentation.length) {
			console.log(`add to mdn-documentation.mjs (atDirectiveDescriptorDescriptions['${directive.name}']):`);
			const fetchedDocs = ['{'];
			for (const descriptor of missingDocumentation) {
				const doc = await fetchDocFromMDN(descriptor, directive.name);
				fetchedDocs.push(`  '${descriptor}': \`${doc ?? ''}\`,`);
			}
			fetchedDocs.push('}');
			console.log(fetchedDocs.join('\n'));
		}
	}

	return allAtDirectives;
}