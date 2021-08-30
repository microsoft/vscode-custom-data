export function sleep(ms: number) {
	return new Promise<void>(resolve => {
		setTimeout(() => {
			resolve()
		}, ms)
	})
}

const browserNames : { [browser: string]: string }= {
	E: 'Edge',
	FF: 'Firefox',
	S: 'Safari',
	C: 'Chrome',
	IE: 'IE',
	O: 'Opera'
}

export function toCompatString(bcdProperty: any) :string[] {
	let s : string[] = []

	if (bcdProperty.__compat) {
		Object.keys(browserNames).forEach((abbrev) => {
			const browserName = browserNames[abbrev].toLowerCase()
			const browserSupport = bcdProperty.__compat.support[browserName]
			if (browserSupport) {
				const shortCompatString = supportToShortCompatString(browserSupport, abbrev)
				if (shortCompatString) {
					s.push(shortCompatString)
				}
			}
		})
	} else {
		Object.keys(browserNames).forEach((abbrev) => {
			const browserName = browserNames[abbrev].toLowerCase()

			// Select the most recent versions from all contexts as the short compat string
			let shortCompatStringAggregatedFromContexts : string | undefined;

			Object.keys(bcdProperty).forEach(contextName => {
				const context = bcdProperty[contextName]
				if (context.__compat && context.__compat.support[browserName]) {
					const browserSupport = context.__compat.support[browserName]
					const shortCompatString = supportToShortCompatString(browserSupport, abbrev)
					if (!shortCompatStringAggregatedFromContexts || shortCompatString > shortCompatStringAggregatedFromContexts) {
						shortCompatStringAggregatedFromContexts = shortCompatString
					}
				}
			})

			if (shortCompatStringAggregatedFromContexts) {
				s.push(shortCompatStringAggregatedFromContexts)
			}
		})

	}
  return s;
}

/**
 * Check that a property is supported in all major browsers: Edge, Firefox, Safari, Chrome, IE, Opera
 */
export function isSupportedInAllBrowsers(bcdProperty: any) {
	if (bcdProperty.__compat) {
		return Object.keys(browserNames).every((abbrev) => {
			const browserName = browserNames[abbrev].toLowerCase()
			if (bcdProperty.__compat && bcdProperty.__compat.support[browserName]) {
				const browserSupport = bcdProperty.__compat.support[browserName]
				if (browserSupport) {
					return isSupported(browserSupport)
				}
			}

			return false
		})
	} else {
		return Object.keys(browserNames).every((abbrev) => {
			const browserName = browserNames[abbrev].toLowerCase()

			return Object.keys(bcdProperty).some(contextName => {
				const context = bcdProperty[contextName]
				if (context.__compat && context.__compat.support[browserName]) {
					const browserSupport = context.__compat.support[browserName]
					if (browserSupport) {
						return isSupported(browserSupport)
					}
				}

				return false
			})
		})
	}
}

/**
 * https://github.com/mdn/browser-compat-data/blob/master/schemas/compat-data-schema.md
 * 
 * Convert a support statement to a short compat string.
 * For example:
 * { "ie": { "version_added": "6.0" } } => "IE6.0"
 * {
 *   "support": {
 *     "firefox": [
 *       {
 *         "version_added": "6"
 *       },
 *       {
 *         "prefix": "-moz-",
 *         "version_added": "3.5",
 *         "version_removed": "9"
 *       }
 *     ]
 *   }
 * } => "FF6"
 */
function supportToShortCompatString(support: any, browserAbbrev: any) {
  let version_added
  if (Array.isArray(support) && support[0] && support[0].version_added) {
    version_added = support[0].version_added
  } else if (support.version_added) {
    version_added = support.version_added
  }

  if (version_added) {
    if (typeof(version_added) === 'boolean') {
      return browserAbbrev
    } else {
      return `${browserAbbrev}${version_added}`
    }
  }

  return null
}

function isSupported(support: any) {
  let version_added
  if (Array.isArray(support) && support[0] && support[0].version_added) {
    version_added = support[0].version_added
  } else if (support.version_added) {
    version_added = support.version_added
  }

  if (version_added) {
    if (typeof(version_added) === 'boolean') {
      return version_added
    } else if (typeof(version_added) === 'string') {
      if (typeof(parseInt(version_added)) === 'number') {
        return true
      }
    }
  }

  return false
}