/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

const chromeAttributeRelevance = require('./attributeRelevance');

function applyRelevance(properties) {
  for (let property of properties) {
    const propName = property.name;
    const matchingPropIndex = chromeAttributeRelevance.findIndex(r => r.name === propName);
    const relevance = matchingPropIndex !== -1 ? (chromeAttributeRelevance[matchingPropIndex].relevance >> 1) : 0;
    if (property.status === 'o' || property.status === 'n') {
      property.relevance = relevance;
    } else {
      property.relevance = 50 + relevance;
    }
  }
  return properties;
}

module.exports = {
  applyRelevance
}