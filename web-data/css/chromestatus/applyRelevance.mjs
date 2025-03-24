// Convert the file to ESM by replacing CommonJS syntax with ES module syntax
import chromeAttributeRelevance from './attributeRelevance.mjs';

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

export { applyRelevance };