/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

//@ts-check

import mdnData from 'mdn-data';
import { definitionSyntax } from 'css-tree';
import mdnCompatData from '@mdn/browser-compat-data' with { type: 'json' };
import { propertyDescriptions as mdnPropertyDescriptions, fetchDocFromMDN } from './mdn-documentation.mjs';

const mdnExcludedProperties = [
  '--*', // custom properties
  'block-overflow', // dropped in favor of `overflow-block`
  // dropped in favor of `offset`
  'motion',
  'motion-offset',
  'motion-path',
  'motion-rotation'
];

const noDoc = ["-webkit-background-composite", "-webkit-margin-bottom-collapse", "-webkit-margin-collapse", "-webkit-margin-start", "-webkit-margin-top-collapse", "-webkit-padding-start", "-webkit-tap-highlight-color", "-webkit-text-fill-color", "-webkit-text-stroke", "-webkit-text-stroke-color", "-webkit-text-stroke-width", "-webkit-touch-callout", "-webkit-user-drag"];

export async function addMDNProperties(vscProperties) {
  const propertyMap = {};

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
    delete allMDNProperties[p];
  });

  /**
   * 1. Go through VSC properties. For each entry that has a matching entry in MDN, merge both entry.
   */
  vscProperties.forEach(p => {
    const name = p.name;
    if (name) {
      const mdnProperty = allMDNProperties[name];
      if (mdnProperty) {
        // use the handcrafted values, if available. Otherwise keep the values from the MDN syntax,
        // unless the restriction already makes the language service propose that family's keywords
        mdnProperty.values = p.values?.length ? p.values : (proposesKeywords(p.restriction) ? undefined : mdnProperty.values);
        propertyMap[p.name] = {
          ...p,
          ...mdnProperty
        };
      } else {
        propertyMap[p.name] = p;
      }
    }
  });

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
      };
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
    console.log('add to mdn-documentation.mjs (propertyDescriptions):');
    for (let prop of missingDocumentation) {
      const doc = await fetchDocFromMDN(prop, propertyMap[prop]?.atRule);
      fetchedDocs.push(`  '${prop}': \`${doc ?? ''}\`,`);
    }
    fetchedDocs.push('}');
    console.log(fetchedDocs.join('\n'));
  }
  return Object.values(propertyMap);
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
  };
}

// restrictions the language service proposes the keywords of itself, e.g. `thin` for `line-width`.
// `image` and `shape` are not in the list, those only propose functions.
const keywordRestrictions = ['color', 'position', 'repeat', 'line-style', 'line-width', 'geometry-box', 'box', 'timing-function'];

function proposesKeywords(restriction) {
  return !!restriction && restriction.split(',').some(r => keywordRestrictions.includes(r.trim()));
}

function getValuesFromSytax(syntax) {
  if (!syntax) {
    return undefined;
  }
  const keywords = new Set();
  try {
    collectKeywords(definitionSyntax.parse(syntax), keywords, true);
  } catch {
    return undefined; // syntax we can not parse
  }
  // the language service proposes these for every property
  for (const cssWideKeyword of ['initial', 'inherit', 'unset']) {
    keywords.delete(cssWideKeyword);
  }
  return keywords.size ? [...keywords].map(name => ({ name })) : undefined;
}

/**
 * Collect the keywords a value can be made of, e.g. `pre` in `normal | pre | <'white-space-collapse'>`.
 * A keyword of a sequence is collected as well, e.g. `dense` of `auto-flow && dense?`, so that it is
 * proposed once the rest of the sequence is typed. Keywords of a nested type are only collected one
 * level deep (`<transition-behavior-value>` -> `normal`, `allow-discrete`), so that a type such as
 * `<color>` does not pull in the keywords of everything it references.
 */
function collectKeywords(node, keywords, resolveTypes) {
  switch (node.type) {
    case 'Keyword':
      keywords.add(node.name);
      break;
    case 'Group':
      // a function call, e.g. `ray( <angle> && contain? )`: its keywords are arguments, not values
      if (!isFunctionCall(node)) {
        node.terms.forEach(term => collectKeywords(term, keywords, resolveTypes));
      }
      break;
    case 'Multiplier':
      collectKeywords(node.term, keywords, resolveTypes);
      break;
    case 'Type': {
      const syntax = resolveTypes ? mdnData.css.syntaxes[node.name]?.syntax : undefined;
      if (syntax) {
        collectKeywords(definitionSyntax.parse(syntax), keywords, false);
      }
      break;
    }
  }
}

/**
 * Whether the group is the arguments of a function, which start with its name, e.g. `ray(`.
 */
function isFunctionCall(group) {
  let first = group;
  while (first?.type === 'Group' || first?.type === 'Multiplier') {
    first = first.type === 'Group' ? first.terms[0] : first.term;
  }
  return first?.type === 'Function';
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
  }[status];
}

export { abbreviateStatus };
