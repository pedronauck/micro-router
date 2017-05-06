const { getParamsAndQuery } = require('../utils')

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

const methodFn = method => (path, handler) => {
  if (!path) throw new Error('You need to set a valid path')
  if (!handler) throw new Error('You need to set a valid handler')

  return (req, res) => {
    const { params, query } = getParamsAndQuery(path, req.url)

    if (params && req.method === method) {
      return handler(Object.assign(req, { params, query }), res)
    }
  }
}

exports.router = (...funcs) => async (req, res) => {
  const filteredFuncs = funcs.filter(fn => (typeof fn === 'function'))

  for (const fn of filteredFuncs) {
    const result = await fn(req, res)
    if (result || res.headersSent) return result
  }
}

METHODS.forEach(method => {
  exports[method === 'DELETE' ? 'del' : method.toLowerCase()] = methodFn(method)
})
