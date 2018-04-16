const { parse } = require('url')
const UrlPattern = require('url-pattern')

const patternOpts = {
  segmentNameCharset: 'a-zA-Z0-9_-',
  segmentValueCharset: 'a-zA-Z0-9@.+-_',
}

const isPattern = pattern => pattern instanceof UrlPattern

const getParamsAndQuery = (pattern, url) => {
  const { query, pathname } = parse(url, true)
  const route = isPattern(pattern)
    ? pattern
    : new UrlPattern(pattern, patternOpts)
  const params = route.match(pathname)

  return { query, params }
}

module.exports = {
  getParamsAndQuery,
  isPattern,
  patternOpts,
}
