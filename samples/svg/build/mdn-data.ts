
const mdnData = require('mdn-data');
const bcdData = require('mdn-browser-compat-data')

import { CSSProperty, CSSSpecProperty } from './svg-spec';
import { toCompatString, isSupportedInAllBrowsers } from './util';

const properties = mdnData.css.properties
const bcdProperties = bcdData.css.properties

export function addCSSMDNData(specProperty: CSSSpecProperty): CSSProperty {
  const property: CSSProperty = { ...specProperty }

  if (getPropertyStatus(specProperty.name)) {
    property.status = getPropertyStatus(specProperty.name)
  }
  if (getPropertySyntax(specProperty.name)) {
    property.syntax = getPropertySyntax(specProperty.name)
  }
  if (getPropertyBrowsers(specProperty.name)) {
    property.browsers = getPropertyBrowsers(specProperty.name)
  }

  return property
}

function getPropertyStatus(name: string) {
  if (properties[name]) {
    return properties[name].status
  }
}

function getPropertySyntax(name: string) {
  if (properties[name]) {
    return properties[name].syntax
  }
}

function getPropertyBrowsers(name: string) {
  if (bcdProperties[name]) {
    if (!isSupportedInAllBrowsers(bcdProperties[name])) {
      return toCompatString(bcdProperties[name])
    }
  }
}