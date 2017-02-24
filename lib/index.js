const { send } = require('micro')
const { getParamsAndQuery } = require('../utils')

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

const notFoundRoute = (req, res) =>
  send(res, 404, { message: `${req.method} doens't match any route` })

const methodFn = method => (path, handler) => url => {
  if (!path) throw new Error('You need to set a valid path')
  if (!handler) throw new Error('You need to set a valid handler')

  const { params, query } = getParamsAndQuery(path, url)
  return params ? { method, params, query, handler } : null
}

exports.router = (...funcs) => async (req, res) => {
  if (!funcs.length) return notFoundRoute(req, res)

  const routes = funcs
    .map(fn => fn(req.url))
    .filter(fn => fn)
    .map(({ handler, params, query }) =>
      handler(Object.assign({}, req, { params, query }), res)
    )

  return await Promise.race(routes)
}

METHODS.forEach(method => {
  exports[method.toLowerCase()] = methodFn(method)
})
