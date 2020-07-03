/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

const chromeAttributeRelevance = require('./attributeRelevance');

function applyRelevance(properties) {
  let newProps = []
  for (const entry of chromeAttributeRelevance) {
    const propName = entry.name;
    const matchingPropIndex = properties.findIndex(p => p.name === propName)
    if (matchingPropIndex !== -1) {
      properties[matchingPropIndex].relevance = entry.relevance;
    }
  }
  return properties;
}

module.exports = {
  applyRelevance
}