function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const UrlPattern = require('url-pattern');
const { getParamsAndQuery, isPattern, patternOpts } = require('../utils');

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

const methodFn = method => (givenPath, handler) => {
  if (!givenPath) throw new Error('You need to set a valid path');
  if (!handler) throw new Error('You need to set a valid handler');

  return (req, res, namespace) => {
    const path = givenPath === '/' ? '(/)' : givenPath;
    const route = isPattern(path) ? path : new UrlPattern(`${namespace}${path}`, patternOpts);

    const { params, query } = getParamsAndQuery(route, req.url);

    if (params && req.method === method) {
      return handler(Object.assign(req, { params, query }), res);
    }
  };
};

const findRoute = (funcs, namespace = '') => (() => {
  var _ref = _asyncToGenerator(function* (req, res) {
    for (const fn of funcs) {
      const result = yield fn(req, res, namespace);
      if (result || res.headersSent) return result;
    }

    return null;
  });

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

exports.router = (...funcs) => findRoute(funcs);

const withNamespace = namespace => (...funcs) => findRoute(funcs, namespace);
exports.withNamespace = withNamespace;

METHODS.forEach(method => {
  exports[method === 'DELETE' ? 'del' : method.toLowerCase()] = methodFn(method);
});

exports.routerNamespace = (...handlers) => upperNameSpace => {
  return (() => {
    var _ref2 = _asyncToGenerator(function* (req, res, ns) {
      const namespacePrefix = `${ns}${upperNameSpace}(/)(/:any)`;
      const namespace = `${ns}${upperNameSpace}`;
      const { params } = getParamsAndQuery(namespacePrefix, req.url);
      if (params) {
        return withNamespace(namespace)(...handlers)(req, res);
      }
    });

    return function (_x3, _x4, _x5) {
      return _ref2.apply(this, arguments);
    };
  })();
};