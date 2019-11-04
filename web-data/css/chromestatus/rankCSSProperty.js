const chromeRanks = require('./attributesRanking');

function rankCSSProperties(properties) {
  let newProps = []

  chromeRanks.forEach(propName => {
    const matchingPropIndex = properties.findIndex(p => p.name === propName)
    if (matchingPropIndex !== -1) {
      newProps.push(properties[matchingPropIndex])
      properties.splice(matchingPropIndex, 1)
    }
  })

  newProps = [...newProps, ...properties]
  return newProps
}

module.exports = {
  rankCSSProperties
}