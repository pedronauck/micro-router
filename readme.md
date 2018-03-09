:station: _**Micro Router -**_ A tiny and functional router for ZEIT's [micro](https://github.com/zeit/micro)

[![GitHub release](https://img.shields.io/github/release/pedronauck/micro-router.svg)]()
[![Build Status](https://travis-ci.org/pedronauck/micro-router.svg?branch=master)](https://travis-ci.org/pedronauck/micro-router)
[![Coveralls](https://img.shields.io/coveralls/pedronauck/micro-router.svg)]()
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/ebdcc3e942b14363a96438b41c770b32)](https://www.codacy.com/app/pedronauck/micro-router?utm_source=github.com&utm_medium=referral&utm_content=pedronauck/micro-router&utm_campaign=Badge_Grade)

## 👌 &nbsp; Features

* **Tiny**. Just couple lines of code.
* **Functional**. Write your http methods using functions.
* **Async**. Design to use with `async/await`

## 💻 &nbsp; Usage

Install as project dependency:

```bash
$ yarn add microrouter
```

Then you can define your routes inside your microservice:

```js
const { send } = require('micro')
const { router, get } = require('microrouter')

const hello = (req, res) => send(res, 200, `Hello ${req.params.who}`)

const notfound = (req, res) => send(res, 404, 'Not found route')

module.exports = router(get('/hello/:who', hello), get('/*', notfound))
```

### `async/await`

You can use your handler as an async function:

```js
const { send } = require('micro')
const { router, get } = require('microrouter')

const hello = async (req, res) =>
  send(res, 200, await Promise.resolve(`Hello ${req.params.who}`))

module.exports = router(get('/hello/:who', hello))
```

### route methods

Each route is a single basic http method that you import from `microrouter` and has the same arguments:

* `get(path = String, handler = Function)`
* `post(path = String, handler = Function)`
* `put(path = String, handler = Function)`
* `patch(path = String, handler = Function)`
* `del(path = String, handler = Function)`
* `head(path = String, handler = Function)`
* `options(path = String, handler = Function)`

#### path

A simple url pattern that you can define your path. In this path you can set your parameters using a `:` notation. The `req` parameter from `handler` will return this parameters as an object.

For more information about how you can define your path, see [url-pattern](https://github.com/snd/url-pattern) that's the package that we're using to match paths.

#### handler

The `handler` method is a simple function that will make some action base on your path.
The format of this function is `(req, res) => {}`

##### `req.params`

As you can see below, the `req` parameter has a property called `params` that represents the parameters defined in your `path`:

```js
const { router, get } = require('microrouter')
const request = require('some-request-lib')

// service.js
module.exports = router(
  get('/hello/:who', (req, res) => req.params)
)

// test.js
const response = await request('/hello/World')

console.log(response)  // { who: 'World' }
```

##### `req.query`

The `req` parameter also has a `query` property that represents the `queries` defined in your requision url:

```js
const { router, get } = require('microrouter')
const request = require('some-request-lib')

// service.js
module.exports = router(
  get('/user', (req, res) => req.query)
)

// test.js
const response = await request('/user?id=1')

console.log(response)  // { id: 1 }
```

### Parsing Body

By default, router _doens't parse anything_ from your requisition, it's just match your paths and execute a specific handler. So, if you want to parse your body requisition you can do something like that:

```js
const { router, post } = require('microrouter')
const { json, send } = require('micro')
const request = require('some-request-lib')

// service.js
const user = async (req, res) => {
  const body = await json(req)
  send(res, 200, body)
}

module.exports = router(
  post('/user', user)
)

// test.js
const body = { id: 1 }
const response = await request.post('/user', { body })
```

### UrlPattern instance as path

The package [url-pattern](https://github.com/snd/url-pattern) has a lot of options inside it to match url. If you has a different need for some of your paths, like make pattern from a regexp, you can pass a instance of `UrlPattern` as the path parameter:

```js
const UrlPattern = require('url-pattern')
const { router, get } = require('microrouter')

const routes = router(
  get(
    new UrlPattern(/^\api/),
    () => 'This will match all routes that start with "api"'
  )
)
```

### Namespaced Routes

If you want to create nested routes, you can define a namespace for your routes using the `withNamespace` high order function:

```js
const { withNamespace, router, get } = require('microrouter')
const { json, send } = require('micro')

const oldApi = withNamespace('/api/v1')
const newApi = withNamespace('/api/v2')

const routes = router(
  oldApi(get('/', () => 'My legacy api route')),
  newApi(get('/', () => 'My new api route'))
)
```

_PS: The nested routes doesn't work if you pass a UrlPattern instance as path argument!_

## 🕺 &nbsp; Contribute

1.  [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your own GitHub account and then [clone](https://help.github.com/articles/cloning-a-repository/) it to your local device
2.  Install dependencies using Yarn: `yarn install`
3.  Make the necessary changes and ensure that the tests are passing using `yarn test`
4.  Send a pull request 🙌
