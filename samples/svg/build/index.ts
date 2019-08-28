import { getSVGSpec, HTMLElement, HTMLAttribute, CSSProperty } from './svg-spec'
import { getMDNMDDescription } from './mdn-description'

import { sleep } from './util'
import * as path from 'path'
import * as fs from 'fs'
import { addCSSMDNData } from './mdn-data'

/**
 * Get static CSS data from
 * - Spec
 * - mdn-data and mdn-browser-compat-data
 */
function getStaticHTMLData() {
  const { elements, globalAttributes } = getSVGSpec()

  return {
    elements,
    globalAttributes
  }
}

/**
 * Attach HTML descriptions from MDN to input properties
 */
async function attachAsyncHTMLDataFromMDN(
  elements: HTMLElement[],
  globalAttributes: HTMLAttribute[]
): Promise<boolean> {
  // Collect all attribute
  const allAttributes = globalAttributes
  elements.forEach(el => {
    el.attributes.forEach(a => {
      if (!allAttributes.find(ta => ta.name === a.name)) {
        allAttributes.push(a)
      }
    })
  })

  for (let e of elements) {
    let desc
    try {
      desc = await getMDNMDDescription(e.name, 'tag')
    } catch (err) {
      return false
    }

    if (desc) {
      e.description = desc
      await sleep(1000)
      console.log(`Done with ${e.name} tag`)
    }
  }

  for (let a of allAttributes) {
    let desc
    try {
      desc = await getMDNMDDescription(a.name, 'attribute')
    } catch (err) {
      return false
    }

    if (desc) {
      a.description = desc
      await sleep(1000)
      console.log(`Done with ${a.name} attribute`)
    }
  }

  return true
}

async function generateHTMLData() {
  const { elements, globalAttributes } = getStaticHTMLData()
  const getMdnDataSuccess = attachAsyncHTMLDataFromMDN(elements, globalAttributes)

  if (!getMdnDataSuccess) {
    console.log('Failed to get data from MDN')
    return
  }

  const htmlOut = {
    version: 1.1,
    tags: elements,
    globalAttributes
  }

  console.log('Writing svg-html-contribution.json')
  fs.writeFileSync(path.resolve(__dirname, '../raw-data/svg-html-contribution.json'), JSON.stringify(htmlOut, null, 2))
  console.log('Done writing svg-html-contribution.json')
}

/**
 * Get static CSS data from
 * - Spec
 * - mdn-data and mdn-browser-compat-data
 */
function getStaticCSSData(): CSSProperty[] {
  const { cssSpecProperties } = getSVGSpec()

  return cssSpecProperties.map(addCSSMDNData)
}

/**
 * Attach CSS descriptions from MDN to input properties
 */
async function attachAsyncCSSDataFromMDN(cssProperties: CSSProperty[]): Promise<boolean> {
  for (let p of cssProperties) {
    let desc
    try {
      desc = await getMDNMDDescription(p.name, 'attribute')
    } catch (err) {
      return false
    }

    if (desc) {
      p.description = desc
      await sleep(1000)
    }
    console.log(`Done with ${p.name} property`)
  }

  return true
}

async function generateCSSData() {
  const cssProperties = getStaticCSSData()
  const getMdnDataSuccess = await attachAsyncCSSDataFromMDN(cssProperties)

  if (!getMdnDataSuccess) {
    console.log('Failed to get data from MDN')
    return
  }

  const cssOut = {
    version: 1.1,
    properties: cssProperties
  }

  console.log('Writing svg-css-contribution.json')
  fs.writeFileSync(path.resolve(__dirname, '../raw-data/svg-css-contribution.json'), JSON.stringify(cssOut, null, 2))
  console.log('Done writing svg-css-contribution.json')
}

async function getHTMLData() {
  const { elements, globalAttributes } = getSVGSpec()

  for (let e of elements) {
    const desc = await getMDNMDDescription(e.name, 'tag')
    if (desc) {
      e.description = desc
      await sleep(1000)
      console.log(`Done with ${e.name} tag`)
    }
  }

  const allAttributes = globalAttributes
  elements.forEach(el => {
    el.attributes.forEach(a => {
      if (!allAttributes.find(ta => ta.name === a.name)) {
        allAttributes.push(a)
      }
    })
  })

  for (let a of allAttributes) {
    const desc = await getMDNMDDescription(a.name, 'attribute')
    if (desc) {
      a.description = desc
      await sleep(1000)
      console.log(`Done with ${a.name} attribute`)
    }
  }

  const htmlOut = {
    tags: elements,
    globalAttributes
  }

  fs.writeFileSync(path.resolve(__dirname, '../raw-data/svg-html-contribution.json'), JSON.stringify(htmlOut, null, 2))
}

;(async () => {
  await generateHTMLData()
  await generateCSSData()
})()
