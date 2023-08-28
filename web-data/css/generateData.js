/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

//@ts-check

const fs = require('fs')
const path = require('path')

const { readFile, writeFile } = fs.promises;

// keep in sync with data from language facts
const colors = {
  aliceblue: '#f0f8ff',
  antiquewhite: '#faebd7',
  aqua: '#00ffff',
  aquamarine: '#7fffd4',
  azure: '#f0ffff',
  beige: '#f5f5dc',
  bisque: '#ffe4c4',
  black: '#000000',
  blanchedalmond: '#ffebcd',
  blue: '#0000ff',
  blueviolet: '#8a2be2',
  brown: '#a52a2a',
  burlywood: '#deb887',
  cadetblue: '#5f9ea0',
  chartreuse: '#7fff00',
  chocolate: '#d2691e',
  coral: '#ff7f50',
  cornflowerblue: '#6495ed',
  cornsilk: '#fff8dc',
  crimson: '#dc143c',
  cyan: '#00ffff',
  darkblue: '#00008b',
  darkcyan: '#008b8b',
  darkgoldenrod: '#b8860b',
  darkgray: '#a9a9a9',
  darkgrey: '#a9a9a9',
  darkgreen: '#006400',
  darkkhaki: '#bdb76b',
  darkmagenta: '#8b008b',
  darkolivegreen: '#556b2f',
  darkorange: '#ff8c00',
  darkorchid: '#9932cc',
  darkred: '#8b0000',
  darksalmon: '#e9967a',
  darkseagreen: '#8fbc8f',
  darkslateblue: '#483d8b',
  darkslategray: '#2f4f4f',
  darkslategrey: '#2f4f4f',
  darkturquoise: '#00ced1',
  darkviolet: '#9400d3',
  deeppink: '#ff1493',
  deepskyblue: '#00bfff',
  dimgray: '#696969',
  dimgrey: '#696969',
  dodgerblue: '#1e90ff',
  firebrick: '#b22222',
  floralwhite: '#fffaf0',
  forestgreen: '#228b22',
  fuchsia: '#ff00ff',
  gainsboro: '#dcdcdc',
  ghostwhite: '#f8f8ff',
  gold: '#ffd700',
  goldenrod: '#daa520',
  gray: '#808080',
  grey: '#808080',
  green: '#008000',
  greenyellow: '#adff2f',
  honeydew: '#f0fff0',
  hotpink: '#ff69b4',
  indianred: '#cd5c5c',
  indigo: '#4b0082',
  ivory: '#fffff0',
  khaki: '#f0e68c',
  lavender: '#e6e6fa',
  lavenderblush: '#fff0f5',
  lawngreen: '#7cfc00',
  lemonchiffon: '#fffacd',
  lightblue: '#add8e6',
  lightcoral: '#f08080',
  lightcyan: '#e0ffff',
  lightgoldenrodyellow: '#fafad2',
  lightgray: '#d3d3d3',
  lightgrey: '#d3d3d3',
  lightgreen: '#90ee90',
  lightpink: '#ffb6c1',
  lightsalmon: '#ffa07a',
  lightseagreen: '#20b2aa',
  lightskyblue: '#87cefa',
  lightslategray: '#778899',
  lightslategrey: '#778899',
  lightsteelblue: '#b0c4de',
  lightyellow: '#ffffe0',
  lime: '#00ff00',
  limegreen: '#32cd32',
  linen: '#faf0e6',
  magenta: '#ff00ff',
  maroon: '#800000',
  mediumaquamarine: '#66cdaa',
  mediumblue: '#0000cd',
  mediumorchid: '#ba55d3',
  mediumpurple: '#9370d8',
  mediumseagreen: '#3cb371',
  mediumslateblue: '#7b68ee',
  mediumspringgreen: '#00fa9a',
  mediumturquoise: '#48d1cc',
  mediumvioletred: '#c71585',
  midnightblue: '#191970',
  mintcream: '#f5fffa',
  mistyrose: '#ffe4e1',
  moccasin: '#ffe4b5',
  navajowhite: '#ffdead',
  navy: '#000080',
  oldlace: '#fdf5e6',
  olive: '#808000',
  olivedrab: '#6b8e23',
  orange: '#ffa500',
  orangered: '#ff4500',
  orchid: '#da70d6',
  palegoldenrod: '#eee8aa',
  palegreen: '#98fb98',
  paleturquoise: '#afeeee',
  palevioletred: '#d87093',
  papayawhip: '#ffefd5',
  peachpuff: '#ffdab9',
  peru: '#cd853f',
  pink: '#ffc0cb',
  plum: '#dda0dd',
  powderblue: '#b0e0e6',
  purple: '#800080',
  red: '#ff0000',
  rebeccapurple: '#663399',
  rosybrown: '#bc8f8f',
  royalblue: '#4169e1',
  saddlebrown: '#8b4513',
  salmon: '#fa8072',
  sandybrown: '#f4a460',
  seagreen: '#2e8b57',
  seashell: '#fff5ee',
  sienna: '#a0522d',
  silver: '#c0c0c0',
  skyblue: '#87ceeb',
  slateblue: '#6a5acd',
  slategray: '#708090',
  slategrey: '#708090',
  snow: '#fffafa',
  springgreen: '#00ff7f',
  steelblue: '#4682b4',
  tan: '#d2b48c',
  teal: '#008080',
  thistle: '#d8bfd8',
  tomato: '#ff6347',
  turquoise: '#40e0d0',
  violet: '#ee82ee',
  wheat: '#f5deb3',
  white: '#ffffff',
  whitesmoke: '#f5f5f5',
  yellow: '#ffff00',
  yellowgreen: '#9acd32'
}

const otherColors = {
  ActiveBorder: 'Active window border.',
  ActiveCaption: 'Active window caption.',
  AppWorkspace: 'Background color of multiple document interface.',
  Background: 'Desktop background.',
  ButtonFace: 'The face background color for 3-D elements that appear 3-D due to one layer of surrounding border.',
  ButtonHighlight:
    'The color of the border facing the light source for 3-D elements that appear 3-D due to one layer of surrounding border.',
  ButtonShadow:
    'The color of the border away from the light source for 3-D elements that appear 3-D due to one layer of surrounding border.',
  ButtonText: 'Text on push buttons.',
  CaptionText: 'Text in caption, size box, and scrollbar arrow box.',
  currentColor:
    "The value of the 'color' property. The computed value of the 'currentColor' keyword is the computed value of the 'color' property. If the 'currentColor' keyword is set on the 'color' property itself, it is treated as 'color:inherit' at parse time.",
  GrayText:
    'Grayed (disabled) text. This color is set to #000 if the current display driver does not support a solid gray color.',
  Highlight: 'Item(s) selected in a control.',
  HighlightText: 'Text of item(s) selected in a control.',
  InactiveBorder: 'Inactive window border.',
  InactiveCaption: 'Inactive window caption.',
  InactiveCaptionText: 'Color of text in an inactive caption.',
  InfoBackground: 'Background color for tooltip controls.',
  InfoText: 'Text color for tooltip controls.',
  Menu: 'Menu background.',
  MenuText: 'Text in menus.',
  Scrollbar: 'Scroll bar gray area.',
  ThreeDDarkShadow:
    'The color of the darker (generally outer) of the two borders away from the light source for 3-D elements that appear 3-D due to two concentric layers of surrounding border.',
  ThreeDFace:
    'The face background color for 3-D elements that appear 3-D due to two concentric layers of surrounding border.',
  ThreeDHighlight:
    'The color of the lighter (generally outer) of the two borders facing the light source for 3-D elements that appear 3-D due to two concentric layers of surrounding border.',
  ThreeDLightShadow:
    'The color of the darker (generally inner) of the two borders facing the light source for 3-D elements that appear 3-D due to two concentric layers of surrounding border.',
  ThreeDShadow:
    'The color of the lighter (generally inner) of the two borders away from the light source for 3-D elements that appear 3-D due to two concentric layers of surrounding border.',
  transparent:
    'Fully transparent. This keyword can be considered a shorthand for rgba(0,0,0,0) which is its computed value.',
  Window: 'Window background.',
  WindowFrame: 'Window frame.',
  WindowText: 'Text in windows.',
  none: '',

  //ignore these
  '-webkit-activelink': '',
  '-webkit-focus-ring-color': '',
  '-webkit-link': '',
  '-webkit-text': ''
}

function clone(obj) {
  var copy = {}
  for (var i in obj) {
    copy[i] = obj[i]
  }
  return copy
}

function getProperties(obj) {
  var res = []
  for (var i in obj) {
    res.push(i)
  }
  return res
}

function getValues(valArr, restriction, ruleName) {
  if (!Array.isArray(valArr)) {
    if (valArr.$) {
      valArr = [valArr]
    } else {
      return []
    }
  }
  var vals = valArr
    .map(function (v) {
      return {
        name: v.$.name,
        desc: v.desc,
        browsers: v.$.browsers !== 'all' ? v.$.browsers : void 0
      }
    })
    .filter(function (v) {
      if (v.browsers === 'none') {
        return false
      }
      return true
    })
  if (restriction.indexOf('color') !== -1) {
    var colorsCopy = clone(colors)
    var otherColorsCopy = clone(otherColors)

    var moreColors = {}

    vals = vals.filter(function (v) {
      if (typeof colorsCopy[v.name] === 'string') {
        delete colorsCopy[v.name]
        return false
      }
      if (typeof otherColorsCopy[v.name] === 'string') {
        /**
         * When property value is `none` and the restriction is not limited to color
         * Relax the restriction and always add `none` to result
         */
        if (v.name === 'none' && restriction !== 'color') {
          return true
        }
        delete otherColorsCopy[v.name]
        return false
      }
      moreColors[v.name] = v.desc
      return true
    })
    var notCovered = []
    for (var i in colorsCopy) {
      notCovered.push(i)
    }
    for (var i in otherColorsCopy) {
      notCovered.push(i)
    }
    if (notCovered.length > 0) {
      // console.log('***' + ruleName + ' uncovered: ' + notCovered.length) // + ' - ' + JSON.stringify(notCovered));
    }

    if (restriction === 'color') {
      var properties = getProperties(moreColors)

      // console.log('---' + ruleName + ' others : ' + properties.length) // + ' - ' + JSON.stringify(properties));
    }
  }

  return vals
}

function toSource(object, keyName) {
  if (!object.css[keyName]) {
    return []
  }
  var result = []
  var entryArr = object.css[keyName].entry
  entryArr.forEach(function (e) {
    if (e.$.browsers === 'none') {
      return
    }
    var data = {
      name: e.$.name,
      desc: e.desc,
      browsers: e.$.browsers !== 'all' ? e.$.browsers : void 0
    }
    if (e.$.restriction) {
      data.restriction = e.$.restriction
    }
    if (e.values) {
      data.values = getValues(e.values.value, data.restriction || '', data.name)
    }

    result.push(data)
  })

  return result
}
const schemaFileName = 'css-schema.json'

const { addMDNProperties } = require('./mdn/mdn-data-importer');
const { addMDNPseudoElements, addMDNPseudoSelectors } = require('./mdn/mdn-data-selector-importer');
const { addBrowserCompatDataToProperties, addMDNReferences } = require('./mdn/mdn-browser-compat-data-importer');
const { applyRelevance } = require('./chromestatus/applyRelevance');

async function process() {

  const data = await readFile(path.resolve(__dirname, schemaFileName));
  const result = JSON.parse(data.toString());
  const atDirectives = toSource(result, 'atDirectives');

  let pseudoClasses = toSource(result, 'pseudoClasses');
  pseudoClasses = await addMDNPseudoSelectors(pseudoClasses);

  let pseudoElements = toSource(result, 'pseudoElements');
  pseudoElements = await addMDNPseudoElements(pseudoElements);

  let properties = toSource(result, 'properties');
  properties = await addMDNProperties(properties)
  properties = applyRelevance(properties)

  addBrowserCompatDataToProperties(atDirectives, pseudoClasses, pseudoElements, properties)
  addMDNReferences(atDirectives, pseudoClasses, pseudoElements, properties)

  const customDataObject = {
    version: 1.1,
    properties,
    atDirectives,
    pseudoClasses,
    pseudoElements
  }

  customDataObject.properties.forEach(convertEntry)
  customDataObject.atDirectives.forEach(convertEntry)
  customDataObject.pseudoClasses.forEach(convertEntry)
  customDataObject.pseudoElements.forEach(convertEntry)

  const outPath = path.resolve(__dirname, '../data/browsers.css-data.json')
  console.log('Writing custom data to: ' + outPath)
  await writeFile(outPath, JSON.stringify(customDataObject, null, 2));
  console.log('Done')
}

/**
 * Temporarily convert old entry to new entry
 * Todo@Pine: Change MDN data generation so this yields new entry
 */
function convertEntry(entry) {
  entry.description = entry.desc
  delete entry.desc

  if (entry.values) {
    entry.values.forEach(v => {
      v.description = v.desc
      delete v.desc

      if (v.browsers) {
        if (v.browsers === 'all') {
          delete v.browsers
        } else {
          v.browsers = entry.browsers.split(',')
          if (v.browsers.length === 1 && v.browsers[0] === 'all') {
            delete v.browsers
          }
        }
      }
    })
  }

  if (entry.browsers) {
    if (entry.browsers === 'all') {
      delete entry.browsers
    } else {
      entry.browsers = entry.browsers.split(',')
    }
  }

  if (entry.restriction) {
    entry.restrictions = entry.restriction.split(',').map(s => {
      return s.trim()
    })
    if (entry.restrictions.length === 1 && entry.restrictions[0] === 'none') {
      delete entry.restrictions
    }
  } else {
    delete entry.restrictions
  }
  delete entry.restriction

  if (entry.status) {
    entry.status = expandEntryStatus(entry.status)
  }
}

function expandEntryStatus(status) {
  switch (status) {
    case 'e':
      return 'experimental'
    case 'n':
      return 'nonstandard'
    case 'o':
      return 'obsolete'
    default:
      return 'standard'
  }
}


process();
