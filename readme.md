:station:  _**Micro Router -**_ A tiny and functional router for ZEIT's [micro](https://github.com/zeit/micro)

[![GitHub release](https://img.shields.io/github/release/pedronauck/micro-router.svg)]()
[![Build Status](https://travis-ci.org/pedronauck/micro-router.svg?branch=master)](https://travis-ci.org/pedronauck/micro-router)
[![Coveralls](https://img.shields.io/coveralls/pedronauck/micro-router.svg)]()
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/ebdcc3e942b14363a96438b41c770b32)](https://www.codacy.com/app/pedronauck/micro-router?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=pedronauck/micro-router&amp;utm_campaign=Badge_Grade)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

## 👌 &nbsp; Features

- **Tiny**. Just 23 lines of code.
- **Functional**. Write your http methods using functions.
- **Async**. Design to use with `async/await`

## 💻 &nbsp; Usage

Install as project dependency:

```bash
$ yarn add microrouter
```

Then you can define your routes inside your microservice:

```js
const { send } = require('micro')
const { router, routerRoutes } = require('microrouter')

const hello = (req, res) =>
  send(res, 200, `Hello ${req.params.who}`)

const notfound = (req, res) =>
  send(res, 404, 'Not found route')

const r = router()
r.get('/hello/:who', hello)
r.get('/*', notfound)

module.exports = routerRoutes(r.routes)
```

### `async/await`

You can use your handler as an async function:

```js
const { send } = require('micro')
const { router, routerRoutes } = require('microrouter')

const hello = async (req, res) =>
  send(res, 200, await Promise.resolve(`Hello ${req.params.who}`))

const r = router()
r.get('/hello/:who', hello)

module.exports = routerRoutes(r.routes)
```

### route methods

Each route is a single basic http method that you import from `microrouter` and has the same arguments:

- `get(path = String, handler = Function)`
- `post(path = String, handler = Function)`
- `put(path = String, handler = Function)`
- `patch(path = String, handler = Function)`
- `del(path = String, handler = Function)`
- `head(path = String, handler = Function)`
- `options(path = String, handler = Function)`

#### path

A simple url pattern that you can define your path. In this path you can set your parameters using a `:` notation. The `req` parameter from `handler` will return this parameters as an object.

For more information about how you can define your path, see [url-pattern](https://github.com/snd/url-pattern) that's the package that we're using to match paths.

#### handler

The `handler` method is a simple function that will make some action base on your path.
The format of this function is `(res, res) => {}`

##### `req.params`

As you can see below, the `req` parameter has a property called `params` that represents the parameters defined in your `path`:

```js
const { router, routerRoutes } = require('microrouter')
const request = require('some-request-lib')

// service.js
const r = router()
r.get('/hello/:who', (req, res) => req.params))

module.exports = routerRoutes(r.routes)

// test.js
const response = await request('/hello/World')

console.log(response)  // { who: 'World' }
```

##### `req.query`

The `req` parameter also has a `query` property that represents the `queries` defined in your requision url:

```js
const { router, routerRoutes } = require('microrouter')
const request = require('some-request-lib')

// service.js
const r = router()
r.get('/user', (req, res) => req.query))

module.exports = routerRoutes(r.routes)

// test.js
const response = await request('/user?id=1')

console.log(response)  // { id: 1 }
```

### Parsing Body

By default, router *doens't parse anything* from your requisition, it's just match your paths and execute a specific handler. So, if you want to parse your body requisition you can do something like that:

```js
const { router, routerRoutes } = require('microrouter')
const { json, send } = require('micro')
const request = require('some-request-lib')

// service.js
const user = async (req, res) => {
  const body = await json(req)
  send(res, 200, body)
}

const r = router()
r.post('/user', user)

module.exports = routerRoutes(r.routes)

// test.js
const body = { id: 1 }
const response = await request.post('/user', { body })
```

### Nesting Router
```js
const { router, routerRoutes } = require('microrouter')
const request = require('some-request-lib')

// service.js
const r = Router();
r.get('/', () => `Hello /`);
const a = Router();
a.get('/a', () => `Hello /v1/a`);
r.use('/v1', a)
module.exports = routerRoutes(r.routes)
  
// test.js
const response = await request('/v1/a')
console.log(response)  // Hello /v1/a
```


## 🕺 &nbsp; Contribute

1. [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your own GitHub account and then [clone](https://help.github.com/articles/cloning-a-repository/) it to your local device
2. Install dependencies using Yarn: `yarn install`
3. Make the necessary changes and ensure that the tests are passing using `yarn test`
4. Send a pull request 🙌
