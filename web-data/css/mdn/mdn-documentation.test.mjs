/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { propertyDescriptions } from './mdn-documentation.mjs';

const data = JSON.parse(readFileSync(new URL('../../data/browsers.css-data.json', import.meta.url), 'utf8'));

for (const name of ['text-wrap-mode', 'text-wrap-style']) {
  test(`${name} descriptions use readable shorthand references`, () => {
    const property = data.properties.find(property => property.name === name);
    assert.ok(property, `${name} must be present in the generated data`);
    assert.equal(property.description, propertyDescriptions[name]);
    for (const description of [propertyDescriptions[name], property.description]) {
      assert.match(description, /using the text-wrap shorthand\./);
      assert.doesNotMatch(description, /\{\{CSSXRef/);
    }
  });
}
