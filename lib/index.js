const { getParamsAndQuery } = require('../utils')

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

const methodFn = method => (path, handler) => (req, res) => {
  if (!path) throw new Error('You need to set a valid path')
  if (!handler) throw new Error('You need to set a valid handler')

  const { params, query } = getParamsAndQuery(path, req.url)

  if (params && req.method === method) {
    return handler(Object.assign({}, req, { params, query }), res)
  }
}

exports.router = (...funcs) => async (req, res) => {
  const routes = funcs.map(fn => fn(req, res)).filter(fn => fn)
  return await Promise.race(routes)
}

METHODS.forEach(method => {
  exports[method.toLowerCase()] = methodFn(method)
})
