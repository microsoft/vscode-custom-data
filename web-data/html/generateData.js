/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

const fs = require('fs')
const path = require('path')
const bcd = require('@mdn/browser-compat-data')

/*---------------------------------------------------------------------------------------------
 * Tags
 *--------------------------------------------------------------------------------------------*/

const htmlTags = require('./htmlTags.json')
const htmlTagDescriptions = require('./mdnTagDescriptions.json')

htmlTags.forEach(t => {
  const matchingTagDescription = htmlTagDescriptions.find(td => td.name === t.name)

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
        }
      }
    })

    const moreAttrs = []
    matchingTagDescription.attributes.forEach(ad => {
      if (!t.attributes.some(a => a.name === ad.name)) {
        moreAttrs.push(ad)
      }
    })
    t.attributes = t.attributes.concat(moreAttrs)
  }
})

htmlTags.forEach(t => {
  if (t.description) {
    t.description = {
      kind: 'markdown',
      value: t.description
    }
  }
})

const bcdHTMLElements = bcd.html.elements
htmlTags.forEach(t => {
  if (bcdHTMLElements[t.name]) {
    const bcdMatchingTag = bcdHTMLElements[t.name]
    if (bcdMatchingTag.__compat && bcdMatchingTag.__compat.mdn_url) {
      if (!t.references) {
        t.references = []
      }
      t.references.push({
        name: 'MDN Reference',
        url: bcdMatchingTag.__compat.mdn_url
      })
    }
  }
})

/*---------------------------------------------------------------------------------------------
 * Global Attributes
 *--------------------------------------------------------------------------------------------*/

const htmlGlobalAttributes = require('./htmlGlobalAttributes.json')

const bcdGlobalAttributes = bcd.html.global_attributes

htmlGlobalAttributes.forEach(a => {
  if (a.description) {
    a.description = {
      kind: 'markdown',
      value: a.description
    }
  }
  if (
    bcdGlobalAttributes[a.name] &&
    bcdGlobalAttributes[a.name].__compat &&
    bcdGlobalAttributes[a.name].__compat.mdn_url
  ) {
    if (!a.references) {
      a.references = []
    }
    a.references.push({
      name: 'MDN Reference',
      url: bcdGlobalAttributes[a.name].__compat.mdn_url
    })
  }
})

/*---------------------------------------------------------------------------------------------
 * Events
 *--------------------------------------------------------------------------------------------*/

const htmlEvents = require('./htmlEvents.json')
/**
 * Todo@Pine Clean up new HTML events and drop the old events
 */
const oldEvents = require('./oldEvents.json')

oldEvents.forEach(e => {
  const match = htmlEvents.find(x => x.name === e.name)
  if (match) {
    if (match.description) {
      e.description = {
        kind: 'markdown',
        value: match.description
      }
    }
  }
});



/*---------------------------------------------------------------------------------------------
 * Aria
 *--------------------------------------------------------------------------------------------*/

const ariaData = require('./ariaData.json')
const ariaSpec = require('./ariaSpec.json')

ariaSpec.forEach(ariaItem => {
  if (ariaItem.description) {
    ariaItem.description = {
      kind: 'markdown',
      value: ariaItem.description
    }
  }
})
const ariaMap = {}

ariaData.forEach(ad => {
  ariaMap[ad.name] = {
    ...ad,
    references: [
      {
        name: 'WAI-ARIA Reference',
        url: `https://www.w3.org/TR/wai-aria-1.1/#${ad.name}`
      }
    ]
  }
})
ariaSpec.forEach(as => {
  if (!ariaMap[as.name]) {
    ariaMap[as.name] = {
      ...as
    }
  } else {
    ariaMap[as.name] = {
      ...ariaMap[as.name],
      ...as
    }
  }
})

const ariaOut = []
for (let a in ariaMap) {
  ariaOut.push(ariaMap[a])
}

/*---------------------------------------------------------------------------------------------
 * Value Sets
 *--------------------------------------------------------------------------------------------*/

const valueSets = require('./valueSets.json')

/*---------------------------------------------------------------------------------------------
 * Synthesize
 *--------------------------------------------------------------------------------------------*/

const customDataObject = {
  version: 1.1,
  tags: htmlTags,
  globalAttributes: [...htmlGlobalAttributes, ...oldEvents, ...ariaOut],
  valueSets: valueSets
}

const outPath = path.resolve(__dirname, '../data/browsers.html-data.json')
console.log('Writing custom data to: ' + outPath)
fs.writeFileSync(outPath, JSON.stringify(customDataObject, null, 2))
console.log('Done')
