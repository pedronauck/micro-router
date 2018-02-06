function Route(method, path, handler) {
  if (!path) throw new Error('You need to set a valid path')
  if (!handler) throw new Error('You need to set a valid handler')
  this.method = method
  this.path = path
  this.handler = handler
}

function Router() {
  if (!(this instanceof Router)) {
    return new Router()
  }
  this.routes = []
}

Router.prototype.use = function (prefix, use) {
  const r = this
  let router = prefix
  if (arguments.length === 2) {
    router = use
  }

  for (const route of router.routes) {
    if (arguments.length === 2 && typeof prefix === 'string') {
      route.path = prefix + route.path
    }
    r.routes.push(route)
  }
}

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
METHODS.forEach(method => {
  Router.prototype[method === 'DELETE' ? 'del' : method.toLowerCase()] = function (path, handler) {
    this.routes.push(new Route(method, path, handler))
  }
})

module.exports = Router
