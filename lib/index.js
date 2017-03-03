const { getParamsAndQuery, parseBody } = require('../utils')

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

const methodFn = method => (path, handler) => {
  if (!path) throw new Error('You need to set a valid path')
  if (!handler) throw new Error('You need to set a valid handler')

  return (req, res, body) => {
    const { params, query } = getParamsAndQuery(path, req.url)

    if (params && req.method === method) {
      return handler(Object.assign({}, req, { params, query, body }), res)
    }
  }
}

exports.router = (...funcs) => async (req, res) => {
  const body = await parseBody(req)
  return funcs.map(fn => fn(req, res, body)).find(fn => fn)
}

METHODS.forEach(method => {
  exports[method.toLowerCase()] = methodFn(method)
})
