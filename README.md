:station:  _**Micro Router -**_ A tiny and functional router Zeit's [micro](https://github.com/zeit/micro)

[![GitHub release](https://img.shields.io/github/release/pedronauck/micro-router.svg)]()
[![Build Status](https://travis-ci.org/pedronauck/micro-router.svg?branch=master)](https://travis-ci.org/pedronauck/micro-router)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

## 👌 &nbsp; Features

- **Tiny**. Just 23 lines of code.
- **Functional**. Write your method using functions.
- **Async**. Design to use with `async/await`

## 💻 &nbsp; Usage

Install as project dependency:

```bash
$ yarn add micro-router
```

Then you can define your routes inside your microservice:

```js
const { send } = require('micro')
const { router, get } = require('micro-router')

const hello = (req, res) =>
  send(res, 200, `Hello ${req.params.who}`)

module.exports = router(
  get('/hello/:who', hello)
)
```

### `async/await`

You can a async function as your method handler:

```js
const { send } = require('micro')
const { router, get } = require('micro-router')

const hello = async (req, res) =>
  send(res, 200, await Promise.resolve(`Hello ${req.params.who}`))

module.exports = router(
  get('/hello/:who', hello)
)
```

### route methods

Each route is a single basic http method that you import from *micro-router* and has the same arguments:

- `get(path, handler)`
- `post(path, handler)`
- `put(path, handler)`
- `patch(path, handler)`
- `delete(path, handler)`
- `head(path, handler)`
- `options(path, handler)`

##### `path`

A simple route path like that you can set any parameters using a `:` notation.
The `req` parameter from `handler` will return this parameters as a object.

```js
const { router, get } = require('micro-router')
const request = require('some-request-lib')

const hello = (req, res) => console.log(req.params) // { who: 'World' }

// service.js
module.exports = router(
  get('/hello/:who', hello)
)

// test.js
const body = await request('/hello/World')
```

##### handler

The `handler` method is simple function that will make some action base on your path. The format of this method is `(res, res) => {}`

## 🕺 &nbsp; Contribute

1. [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your own GitHub account and then [clone](https://help.github.com/articles/cloning-a-repository/) it to your local device
2. Install dependencies using Yarn: `yarn install`
3. Make the necessary changes and ensure that the tests are passing using `yarn test`
4. Send a pull request 🙌
