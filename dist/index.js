function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const { getParamsAndQuery } = require('../utils');

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

const methodFn = method => (path, handler) => {
  if (!path) throw new Error('You need to set a valid path');
  if (!handler) throw new Error('You need to set a valid handler');

  return (req, res) => {
    const { params, query } = getParamsAndQuery(path, req.url);

    if (params && req.method === method) {
      return handler(Object.assign(req, { params, query }), res);
    }
  };
};

exports.router = (...funcs) => (() => {
  var _ref = _asyncToGenerator(function* (req, res) {
    for (const fn of funcs) {
      const result = yield fn(req, res);
      if (result || res.headersSent) return result;
    }
  });

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

METHODS.forEach(method => {
  exports[method === 'DELETE' ? 'del' : method.toLowerCase()] = methodFn(method);
});