const { parse } = require('url')
const Route = require('route-parser')

const getParamsAndQuery = (path, url) => {
  const { query } = parse(url, true)
  const route = new Route(path)
  const params = route.match(url)

  return { query, params }
}

module.exports = {
  getParamsAndQuery
}
