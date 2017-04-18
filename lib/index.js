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

exports.router = (...funcs) => (req, res) => {
  for (const fn of funcs) {
    return Promise.resolve(fn(req, res))
      .then(result => (result || res.headersSent) ? result : null);
  }
}

METHODS.forEach(method => {
  exports[method.toLowerCase()] = methodFn(method)
})
