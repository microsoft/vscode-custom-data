/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import bcd from '@mdn/browser-compat-data' with { type: 'json' };

export function addBrowserCompatDataToProperties(atdirectives, pseudoclasses, pseudoelements, properties) {
  atdirectives.forEach(item => {
    addCompatData(item, 'at-rules', item.name.slice(1));
  });

  pseudoclasses.forEach(item => {
    let featureName = item.name.slice(1);
    if (featureName.endsWith('()')) {
      featureName = featureName.slice(0, -2);
    }
    item.name = `:${featureName}`;
    addCompatData(item, 'selectors', featureName);
  });

  pseudoelements.forEach(item => {
    let featureName = item.name.slice(2);
    if (featureName.endsWith('()')) {
      featureName = featureName.slice(0, -2);
    }
    item.name = `::${featureName}`;
    addCompatData(item, 'selectors', featureName);
  });

  properties.forEach(item => {
    addCompatData(item, 'properties', item.name);
  });
}

function addCompatData(item, namespace, featureName) {
  if (!(featureName in bcd.css[namespace])) {
    return;
  }

  const matchingBCDItem = bcd.css[namespace][featureName];
  item.bcdKey = `css.${namespace}.${featureName}`;
  addBCDToBrowsers(item, matchingBCDItem);
}

export function addMDNReferences(atdirectives, pseudoclasses, pseudoelements, properties) {
  const addReference = (item, matchingItem) => {
    if (matchingItem.__compat && matchingItem.__compat.mdn_url) {
      if (!item.references) {
        item.references = [];
      }
      item.references.push({
        name: 'MDN Reference',
        url: matchingItem.__compat.mdn_url
      });
    }
  };

  atdirectives.forEach(item => {
    if (bcd.css['at-rules'][item.name.slice(1)]) {
      const matchingBCDItem = bcd.css['at-rules'][item.name.slice(1)];
      addReference(item, matchingBCDItem);
    }
  });

  pseudoclasses.forEach(item => {
    if (bcd.css.selectors[item.name.slice(1)]) {
      const matchingBCDItem = bcd.css.selectors[item.name.slice(1)];
      addReference(item, matchingBCDItem);
    }
  });

  pseudoelements.forEach(item => {
    if (bcd.css.selectors[item.name.slice(2)]) {
      const matchingBCDItem = bcd.css.selectors[item.name.slice(2)];
      addReference(item, matchingBCDItem);
    }
  });

  properties.forEach(item => {
    if (bcd.css.properties[item.name]) {
      const matchingBCDItem = bcd.css.properties[item.name];
      addReference(item, matchingBCDItem);
    }
  });
}

const browserNames = {
  E: 'Edge',
  FF: 'Firefox',
  FFA: 'Firefox_Android',
  S: 'Safari',
  SM: 'Safari_iOS',
  C: 'Chrome',
  CA: 'Chrome_Android',
  IE: 'IE',
  O: 'Opera'
};

function addBCDToBrowsers(item, matchingBCDItem) {
  const compatString = toCompatString(matchingBCDItem);

  if (compatString !== '') {
    if (!item.browsers) {
      item.browsers = compatString;
    } else {
      if (item.browsers !== compatString) {
        item.browsers = compatString;
      }
    }
  }
}

function toCompatString(bcdProperty) {
  let s = [];

  if (bcdProperty.__compat) {
    Object.keys(browserNames).forEach((abbrev) => {
      const browserName = browserNames[abbrev].toLowerCase();
      const browserSupport = bcdProperty.__compat.support[browserName];
      if (browserSupport) {
        const shortCompatString = supportToShortCompatString(browserSupport, abbrev);
        if (shortCompatString) {
          s.push(shortCompatString);
        }
      }
    });
  } else {
    Object.keys(browserNames).forEach((abbrev) => {
      const browserName = browserNames[abbrev].toLowerCase();

      let shortCompatStringAggregatedFromContexts;

      Object.keys(bcdProperty).forEach(contextName => {
        const context = bcdProperty[contextName];
        if (context.__compat && context.__compat.support[browserName]) {
          const browserSupport = context.__compat.support[browserName];
          const shortCompatString = supportToShortCompatString(browserSupport, abbrev);
          if (!shortCompatStringAggregatedFromContexts || shortCompatString > shortCompatStringAggregatedFromContexts) {
            shortCompatStringAggregatedFromContexts = shortCompatString;
          }
        }
      });

      if (shortCompatStringAggregatedFromContexts) {
        s.push(shortCompatStringAggregatedFromContexts);
      }
    });
  }
  return s.join(',');
}

function supportToShortCompatString(support, browserAbbrev) {
  let version_added;
  if (Array.isArray(support) && support[0] && support[0].version_added) {
    version_added = support[0].version_added;
  } else if (support.version_added) {
    version_added = support.version_added;
  }

  if (version_added) {
    if (typeof(version_added) === 'string') {
      if (version_added.startsWith('≤')) {
        version_added = version_added.substring(1);
      }
      return `${browserAbbrev}${version_added}`;
    }
    return browserAbbrev;
  }

  return null;
}

function isSupported(support) {
  let version_added;
  if (Array.isArray(support) && support[0] && support[0].version_added) {
    version_added = support[0].version_added;
  } else if (support.version_added) {
    version_added = support.version_added;
  }

  if (version_added) {
    if (typeof(version_added) === 'boolean') {
      return version_added;
    } else if (typeof(version_added) === 'string') {
      if (typeof(parseInt(version_added)) === 'number') {
        return true;
      }
    }
  }

  return false;
}

export { browserNames };
