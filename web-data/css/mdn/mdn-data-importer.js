/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

//@ts-check

const mdnData = require('mdn-data');
const mdnCompatData = require('@mdn/browser-compat-data');
const { propertyDescriptions: mdnPropertyDescriptions, fetchDocFromMDN } = require('./mdn-documentation');

const mdnExcludedProperties = [
  '--*', // custom properties
  'block-overflow', // dropped in favor of `overflow-block`
  // dropped in favor of `offset`
  'motion',
  'motion-offset',
  'motion-path',
  'motion-rotation'
]

const noDoc = ["-webkit-background-composite", "-webkit-margin-bottom-collapse", "-webkit-margin-collapse", "-webkit-margin-start", "-webkit-margin-top-collapse", "-webkit-padding-start", "-webkit-tap-highlight-color", "-webkit-text-fill-color", "-webkit-text-stroke", "-webkit-text-stroke-color", "-webkit-text-stroke-width", "-webkit-touch-callout", "-webkit-user-drag"];

async function addMDNProperties(vscProperties) {
  const propertyMap = {}

  const mdnProperties = mdnData.css.properties;
  const mdnCompatProperties = mdnCompatData.css.properties;

  const mdnAtRules = mdnData.css.atRules;
  const mdnCompatAtRules = mdnCompatData.css['at-rules'];

  const allMDNProperties = {};

  for (const property of Object.keys(mdnProperties)) {
    allMDNProperties[property] = extractMDNProperties(undefined, mdnProperties[property], mdnCompatProperties[property]);
  }

  // Flatten at-rule properties and put all properties together
  for (const atRuleName of Object.keys(mdnAtRules)) {
    if (mdnAtRules[atRuleName].descriptors) {
      for (const atRulePropertyName of Object.keys(mdnAtRules[atRuleName].descriptors)) {
        allMDNProperties[atRulePropertyName] = extractMDNProperties(atRuleName, mdnAtRules[atRuleName].descriptors[atRulePropertyName], mdnCompatAtRules[atRuleName]?.[atRulePropertyName]);
      }
    }
  }

  mdnExcludedProperties.forEach(p => {
    delete allMDNProperties[p]
  })

  /**
   * 1. Go through VSC properties. For each entry that has a matching entry in MDN, merge both entry.
   */
  vscProperties.forEach(p => {
    const name = p.name;
    if (name) {
      const mdnProperty = allMDNProperties[name];
      if (mdnProperty) {
        if (p.values) {
          // use the handcrafted values, if available
          mdnProperty.values = p.values;
        }
        propertyMap[p.name] = {
          ...p,
          ...mdnProperty
        }
      } else {
        propertyMap[p.name] = p
      }
    }
  })

  /**
   * 2. Go through MDN properties. For each entry that hasn't been recorded, add it with empty description.
   */
  for (const pn of Object.keys(allMDNProperties)) {
    if (!propertyMap[pn]) {
      propertyMap[pn] = {
        name: pn,
        desc: '',
        restriction: 'none',
        ...allMDNProperties[pn]
      }
    }
  }

  const missingDocumentation = [];

  /**
   * 3. If there's a property without any documentation, try adding MDN documentation to it
   */
  for (const pn of Object.keys(propertyMap)) {
    if (!propertyMap[pn].desc || propertyMap[pn].desc === '') {
      if (mdnPropertyDescriptions[pn]) {
        propertyMap[pn].desc = mdnPropertyDescriptions[pn];
      } else if (noDoc.indexOf(pn) === -1) {
        missingDocumentation.push(pn);
        console.log(`Missing documentaton for ${pn}.`);
      }
    } else if (mdnPropertyDescriptions[pn]) {
      console.log(`Extra documentaton for ${pn} no longer needed`);
    }
  }

  if (missingDocumentation.length) {
    const fetchedDocs = ['{'];
    console.log('add to mdn-documentation.ts (propertyDescriptions):');
    for (let prop of missingDocumentation) {
      const doc = await fetchDocFromMDN(prop, propertyMap[prop]?.atRule);
      fetchedDocs.push(`  '${prop}': \`${doc ?? ''}\`,`);
    }
    fetchedDocs.push('}');
    console.log(fetchedDocs.join('\n'));
  }
  return Object.values(propertyMap)
}

/**
 * Extract only the MDN data that we use
 */
function extractMDNProperties(atRule, mdnEntry, mdCompatEntry) {
  return {
    atRule,
    status: abbreviateStatus(mdnEntry, mdCompatEntry),
    syntax: mdnEntry.syntax,
    values: getValuesFromSytax(mdnEntry.syntax)
  }
}

function getValuesFromSytax(syntax) {
  // collect the values if the syntax is simple (a | b | c)
  if (/^[\w-]+(?:\s*\|\s*[\w-]+)*$/.test(syntax)) {
    return syntax.split('|').map(e => e.trim()).map(name => ({ name }));
  }
  return undefined;
}

/**
 * Make syntax as small as possible for browser usage
 */
function abbreviateStatus(mdnEntry, mdnCompatEntry) {

  let status = mdnEntry.status;
  if (mdnCompatEntry) {
    let compatData = mdnCompatEntry.__compat;
    if (!compatData) {
      for (const contextName in mdnCompatEntry) {
        if (mdnCompatEntry[contextName].__compat) {
          compatData = mdnCompatEntry[contextName].__compat;
          break;
        }
      }
    }

    const compatStatus = compatData?.status;
    if (compatStatus) {
      if (compatStatus.experimental) {
        status = 'experimental';
      } else if (compatStatus.deprecated) {
        status = 'obsolete';
      } else if (compatStatus.standard_track) {
        status = 'standard';
      } else {
        status = 'nonstandard';
      }
    }
  }

  if (mdnEntry.status === 'standard') {
    return undefined;
  }

  return {
    nonstandard: 'n',
    experimental: 'e',
    obsolete: 'o'
  }[status]
}

module.exports = {
  abbreviateStatus,
  addMDNProperties
}
