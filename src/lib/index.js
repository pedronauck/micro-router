const UrlPattern = require('url-pattern')
const { getParamsAndQuery, isPattern, patternOpts } = require('../utils')

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

const methodFn = method => (path, handler) => {
  if (!path) throw new Error('You need to set a valid path')
  if (!handler) throw new Error('You need to set a valid handler')

  return (req, res, namespace) => {
    if (path === '/') {
      path = '(/)'
    }
    const route = isPattern(path)
      ? path
      : new UrlPattern(`${namespace}${path}`, patternOpts)

    const { params, query } = getParamsAndQuery(route, req.url)

    if (params && req.method === method) {
      return handler(Object.assign(req, { params, query }), res)
    }
  }
}

const findRoute = (funcs, namespace = '') => async (req, res) => {
  for (const fn of funcs) {
    const result = await fn(req, res, namespace)
    if (result || res.headersSent) return result
  }

  return null
}

exports.router = (...funcs) => findRoute(funcs)
exports.withNamespace = namespace => (...funcs) => findRoute(funcs, namespace)

METHODS.forEach(method => {
  exports[method === 'DELETE' ? 'del' : method.toLowerCase()] = methodFn(method)
})
