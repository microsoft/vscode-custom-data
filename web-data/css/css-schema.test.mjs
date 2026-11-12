/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

function assertUniqueValues(properties) {
	const duplicates = properties.flatMap(property => {
		const seen = new Set();
		return property.values.filter(value => {
			if (seen.has(value)) {
				return true;
			}
			seen.add(value);
			return false;
		}).map(value => ({ property: property.name, value }));
	});
	assert.deepStrictEqual(duplicates, []);
}

test('CSS schema property values are unique', async () => {
	const schema = JSON.parse(await readFile(new URL('./css-schema.json', import.meta.url), 'utf8'));
	assertUniqueValues(schema.css.properties.entry.map(property => ({
		name: property.$.name,
		values: [property.values?.value ?? []].flat().map(value => value.$.name)
	})));
});

test('Generated CSS property values are unique', async () => {
	const data = JSON.parse(await readFile(new URL('../data/browsers.css-data.json', import.meta.url), 'utf8'));
	assertUniqueValues(data.properties.map(property => ({
		name: property.name,
		values: (property.values ?? []).map(value => value.name)
	})));
});
