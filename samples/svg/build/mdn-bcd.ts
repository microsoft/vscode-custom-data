const bcd = require('@mdn/browser-compat-data')

import * as fs from 'fs'
import * as path from 'path'
import { CSSProperty } from './svg-spec';

const el = bcd.svg.elements as any
const at = bcd.svg.attributes as any

function htmlExport() {
  const tags = []
  for (let e in el) {
    tags.push({
      label: e,
      description: `svg tag: ${e}`,
      attributes: []
    })
  }

  const serializedTags = JSON.stringify({ tags }, null, 2)

  fs.writeFileSync(path.resolve(__dirname, '../data/svg-tags.json'), serializedTags)

  const attributes = []
  for (let category in at) {
    for (let a in at[category]) {
      attributes.push({
        label: a,
        description: `svg attribute: ${a}`
      })
    }
  }
  
  const serializedAttributes = JSON.stringify({ attributes }, null, 2)

  fs.writeFileSync(path.resolve(__dirname, '../data/svg-attributes.json'), serializedAttributes)
}

function cssExport() {
  const properties = []
  for (let category in at) {
    for (let a in at[category]) {
      properties.push({
        name: a,
        desc: `svg attribute: ${a}`
      })
    }
  }
  
  const serializedProperties = JSON.stringify({ properties }, null, 2)
  fs.writeFileSync(path.resolve(__dirname, '../data/svg-properties.json'), serializedProperties)
}

// htmlExport()
// cssExport()


/**
 * In 
 */
function addMDNData(properties: Partial<CSSProperty>[]) {

}