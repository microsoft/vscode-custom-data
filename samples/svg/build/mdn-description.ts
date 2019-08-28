import * as got from 'got'
import * as TurndownService from 'turndown'

const MDN_ROOT = 'https://developer.mozilla.org'

const turndownService = new TurndownService()

export type PropertyType = 'tag' | 'attribute'

async function getMDNHTMLDescription(name: string, type: PropertyType): Promise<string> {
  if (type === 'tag') {
    try {
      const svgres = await got(`https://developer.mozilla.org/en-US/docs/Web/SVG/Element/${name}$json`, {
        json: true
      })
      if (svgres.body && svgres.body.summary) {
        return svgres.body.summary
      }
    } catch (err) {
      const htmlres = await got(`https://developer.mozilla.org/en-US/docs/Web/HTML/Element/${name}$json`, {
        json: true
      })
      if (htmlres.body && htmlres.body.summary) {
        return htmlres.body.summary
      }
    }

    return null
  } else {
    try {
      const svgres = await got(`https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/${name}$json`, {
        json: true
      })
      if (svgres.body && svgres.body.summary) {
        return svgres.body.summary
      }
    } catch (err) {
      const cssres = await got(`https://developer.mozilla.org/en-US/docs/Web/CSS/${name}$json`, {
        json: true
      })
      if (cssres.body && cssres.body.summary) {
        return cssres.body.summary
      }
    }

    return null
  }
}

export async function getMDNMDDescription(name: string, type: PropertyType) {
  try {
    const htmlSummary = await getMDNHTMLDescription(name, type)
    const mdSummary: string = turndownService.turndown(htmlSummary)

    return mdSummary.replace(/\]\(\//g, `](${MDN_ROOT}/`)
  } catch (err) {
    return null
  }
}
