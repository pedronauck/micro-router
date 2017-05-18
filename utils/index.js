const { parse } = require('url')
const UrlPattern = require('url-pattern')

const getParamsAndQuery = (patternOrRoute, url) => {
  const { query, pathname } = parse(url, true)

  const route =
    patternOrRoute instanceof UrlPattern ? patternOrRoute : new UrlPattern(patternOrRoute)

  const params = route.match(pathname)
  return { query, params }
}

module.exports = {
  getParamsAndQuery
}
