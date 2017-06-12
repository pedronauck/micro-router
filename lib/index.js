const UrlPattern = require('url-pattern')
const { getParamsAndQuery } = require('../utils')

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

const methodFn = method => (path, handler) => {
  if (!path) throw new Error('You need to set a valid path')
  if (!handler) throw new Error('You need to set a valid handler')

  const route = new UrlPattern(path)

  return (req, res) => {
    const { params, query } = getParamsAndQuery(route, req.url)

    if (params && req.method === method) {
      return handler(Object.assign(req, { params, query }), res)
    }
  }
}

exports.router = (...funcs) => async (req, res) => {
  for (const fn of funcs) {
    const result = await fn(req, res)
    if (result || res.headersSent) return result
  }

  res.writeHead(404)
  res.end(`Cannot ${req.method} ${req.url}`)
}

METHODS.forEach(method => {
  exports[method === 'DELETE' ? 'del' : method.toLowerCase()] = methodFn(method)
})
