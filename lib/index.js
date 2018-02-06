const UrlPattern = require('url-pattern')
const { getParamsAndQuery, patternOpts } = require('../utils')
const Router = require('../model')

const methodFn = method => (path, handler) => {
  if (!path) throw new Error('You need to set a valid path')
  if (!handler) throw new Error('You need to set a valid handler')

  const route = new UrlPattern(path, patternOpts)

  return (req, res) => {
    const { params, query } = getParamsAndQuery(route, req.url)

    if (params && req.method === method) {
      return handler(Object.assign(req, { params, query }), res)
    }
  }
}

const router = funcs => async (req, res) => {
  for (const fn of funcs) {
    const result = await fn(req, res)
    if (result || res.headersSent) return result
  }

  return false
}

exports.routerRoutes = funcs => {
  const methods = []
  for (const fn of funcs) {
    methods.push(
      methodFn(fn.method)(fn.path, fn.handler)
    )
  }
  return router(methods)
}

exports.router = () => {
  return new Router()
}
