const chromeRanks = require('./attributesRanking');

function rankCSSProperties(properties) {
  let newProps = []
  for (let i = 0; i < chromeRanks.length; i++) {
    const propName = chromeRanks[i];
    const matchingPropIndex = properties.findIndex(p => p.name === propName)
    if (matchingPropIndex !== -1) {
      properties[matchingPropIndex].rank = i;
    }
  }
  return properties;
}

module.exports = {
  rankCSSProperties
}