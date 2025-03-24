import fs from 'fs';
import path from 'path';
import bcd from '@mdn/browser-compat-data' with { type: 'json' };
import htmlTags from './htmlTags.json' with { type: 'json' };
import htmlTagDescriptions from './mdnTagDescriptions.json'  with { type: 'json' };
import htmlGlobalAttributes from './htmlGlobalAttributes.json' with { type: 'json' };
import htmlEvents from './htmlEvents.json' with { type: 'json' };
import oldEvents from './oldEvents.json' with { type: 'json' };
import ariaData from './ariaData.json' with { type: 'json' };
import ariaSpec from './ariaSpec.json' with { type: 'json' };
import valueSets from './valueSets.json' with { type: 'json' };

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
  if (
    bcdGlobalAttributes[a.name] &&
    bcdGlobalAttributes[a.name].__compat &&
    bcdGlobalAttributes[a.name].__compat.mdn_url
  ) {
    if (!a.references) {
      a.references = [];
    }
    a.references.push({
      name: 'MDN Reference',
      url: bcdGlobalAttributes[a.name].__compat.mdn_url
    });
  }
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

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const outPath = path.resolve(__dirname, '../data/browsers.html-data.json');
console.log('Writing custom data to: ' + outPath);
fs.writeFileSync(outPath, JSON.stringify(customDataObject, null, 2));
console.log('Done');
