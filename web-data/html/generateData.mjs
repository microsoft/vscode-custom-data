/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcd from '@mdn/browser-compat-data' with { type: 'json' };
import { getStatus } from 'compute-baseline';
import htmlTags from './htmlTags.json' with { type: 'json' };
import htmlTagDescriptions from './mdnTagDescriptions.json'  with { type: 'json' };
import htmlGlobalAttributes from './htmlGlobalAttributes.json' with { type: 'json' };
import htmlEvents from './htmlEvents.json' with { type: 'json' };
import oldEvents from './oldEvents.json' with { type: 'json' };
import ariaData from './ariaData.json' with { type: 'json' };
import ariaSpec from './ariaSpec.json' with { type: 'json' };
import valueSets from './valueSets.json' with { type: 'json' };
import { supportToShortCompatString } from '../css/mdn/mdn-browser-compat-data-importer.mjs';


function getFeatureId(compat) {
  return compat?.tags?.find(tag => {
    const parts = tag.split(':');
    return parts.length == 2 && parts[0] == 'web-features';
  })?.split(':')[1];
}

const BaselineBrowserAbbreviations = {
  "chrome": "C",
  "chrome_android": "CA",
  "edge": "E",
  "firefox": "FF",
  "firefox_android": "FFA",
  "safari": "S",
  "safari_ios": "SM"
};

function getBrowserCompatString(support) {
  if (!support) {
    return;
  }
  return Object.entries(support).map(([browser, version_added]) => {
    const abbreviation = BaselineBrowserAbbreviations[browser];
    return supportToShortCompatString({version_added}, abbreviation);
  });
}

/*---------------------------------------------------------------------------------------------
 * Tags
 *---------------------------------------------------------------------------------------------*/

htmlTags.forEach(t => {
  const matchingTagDescription = htmlTagDescriptions.find(td => td.name === t.name);

  if (matchingTagDescription) {
    t.attributes.forEach(a => {
      const matchingAttrDescription =
        matchingTagDescription.attributes.filter(ad => ad.name === a.name && ad.description)
          .map(ad => ad.description)
          .join('\n');
      if (matchingAttrDescription) {
        a.description = {
          kind: 'markdown',
          value: matchingAttrDescription
        };
      }
    });

    const moreAttrs = [];
    matchingTagDescription.attributes.forEach(ad => {
      if (!t.attributes.some(a => a.name === ad.name)) {
        moreAttrs.push(ad);
      }
    });
    t.attributes = t.attributes.concat(moreAttrs);
  }
});

htmlTags.forEach(t => {
  if (t.description) {
    t.description = {
      kind: 'markdown',
      value: t.description
    };
  }
});

const bcdHTMLElements = bcd.html.elements;
htmlTags.forEach(t => {
  if (bcdHTMLElements[t.name]) {
    const bcdMatchingTag = bcdHTMLElements[t.name];
    if (bcdMatchingTag.__compat && bcdMatchingTag.__compat.mdn_url) {
      if (!t.references) {
        t.references = [];
      }
      t.references.push({
        name: 'MDN Reference',
        url: bcdMatchingTag.__compat.mdn_url
      });

      // Add the Baseline status to the HTML element
      const featureId = getFeatureId(bcdMatchingTag.__compat);
      if (!featureId) {
        return;
      }
      const status = getStatus(featureId, `html.elements.${t.name}`);
      if (!status) {
        return;
      }
      t.browsers = getBrowserCompatString(status.support);
      delete status.support;
      t.status = status;

      // Add the Baseline status to each attribute
      t.attributes.forEach(a => {
        const bcdMatchingAttr = bcdHTMLElements[t.name][a.name];
        if (!bcdMatchingAttr) {
          return;
        }
        const attrFeatureId = getFeatureId(bcdMatchingAttr.__compat) || featureId;
        const attrStatus = getStatus(attrFeatureId, `html.elements.${t.name}.${a.name}`);
        if (!attrStatus) {
          return;
        }
        a.browsers = getBrowserCompatString(attrStatus.support);
        delete attrStatus.support;
        a.status = attrStatus;
      });
    }
  }
});

/*---------------------------------------------------------------------------------------------
 * Global Attributes
 *---------------------------------------------------------------------------------------------*/

const bcdGlobalAttributes = bcd.html.global_attributes;

htmlGlobalAttributes.forEach(a => {
  if (a.description) {
    a.description = {
      kind: 'markdown',
      value: a.description
    };
  }
  const bcdMatchingAttr = bcdGlobalAttributes[a.name];
  if (bcdMatchingAttr?.__compat?.mdn_url) {
    if (!a.references) {
      a.references = [];
    }
    a.references.push({
      name: 'MDN Reference',
      url: bcdMatchingAttr.__compat.mdn_url
    });
  }

  const featureId = getFeatureId(bcdMatchingAttr?.__compat);
  if (!featureId) {
    return;
  }
  const status = getStatus(featureId, `html.global_attributes.${a.name}`);
  if (!status) {
    return;
  }
  a.browsers = getBrowserCompatString(status.support);
  delete status.support;
  a.status = status;
});

/*---------------------------------------------------------------------------------------------
 * Events
 *---------------------------------------------------------------------------------------------*/

/**
 * Todo@Pine Clean up new HTML events and drop the old events
 */

oldEvents.forEach(e => {
  const match = htmlEvents.find(x => x.name === e.name);
  if (match) {
    if (match.description) {
      e.description = {
        kind: 'markdown',
        value: match.description
      };
    }
  }
});

/*---------------------------------------------------------------------------------------------
 * Aria
 *---------------------------------------------------------------------------------------------*/

ariaSpec.forEach(ariaItem => {
  if (ariaItem.description) {
    ariaItem.description = {
      kind: 'markdown',
      value: ariaItem.description
    };
  }
});
const ariaMap = {};

ariaData.forEach(ad => {
  ariaMap[ad.name] = {
    ...ad,
    references: [
      {
        name: 'WAI-ARIA Reference',
        url: `https://www.w3.org/TR/wai-aria-1.1/#${ad.name}`
      }
    ]
  };
});
ariaSpec.forEach(as => {
  if (!ariaMap[as.name]) {
    ariaMap[as.name] = {
      ...as
    };
  } else {
    ariaMap[as.name] = {
      ...ariaMap[as.name],
      ...as
    };
  }
});

const ariaOut = [];
for (let a in ariaMap) {
  ariaOut.push(ariaMap[a]);
}

/*---------------------------------------------------------------------------------------------
 * Value Sets
 *---------------------------------------------------------------------------------------------*/

/*---------------------------------------------------------------------------------------------
 * Synthesize
 *---------------------------------------------------------------------------------------------*/

const customDataObject = {
  version: 1.1,
  tags: htmlTags,
  globalAttributes: [...htmlGlobalAttributes, ...oldEvents, ...ariaOut],
  valueSets: valueSets
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.resolve(__dirname, '../data/browsers.html-data.json');
console.log('Writing custom data to: ' + outPath);
fs.writeFileSync(outPath, JSON.stringify(customDataObject, null, 2));
console.log('Done');
