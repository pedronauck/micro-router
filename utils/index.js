const { parse } = require('url')
const { json } = require('micro')
const UrlPattern = require('url-pattern')

const getParamsAndQuery = (pattern, url) => {
  const { query, pathname } = parse(url, true)
  const route = new UrlPattern(pattern)
  const params = route.match(pathname)

  return { query, params }
}

const parseBody = async req => {
  try {
    return await json(req)
  } catch (err) {
    return {}
  }
}

module.exports = {
  getParamsAndQuery,
  parseBody
}
