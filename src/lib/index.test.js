const { Readable } = require('stream')
const fs = require('fs')
const test = require('ava')
const micro = require('micro')
const listen = require('test-listen')
const request = require('request-promise')
const UrlPattern = require('url-pattern')

const { withNamespace, router, get } = require('./')

const server = fn => listen(micro(fn))

test('different routes', async t => {
  const routes = router(
    get('/foo', () => ({ name: 'foo' })),
    get('/bar', () => ({ name: 'bar' }))
  )

  const url = await server(routes)
  const fooGet = await request(`${url}/foo`)
  const barGet = await request(`${url}/bar`)

  t.is(JSON.parse(fooGet).name, 'foo')
  t.is(JSON.parse(barGet).name, 'bar')
})

test('routes with params and query', async t => {
  const hello = req => `Hello ${req.params.msg} ${req.query.time}`

  const routes = router(get('/hello/:msg', hello))

  const url = await server(routes)
  const response = await request(`${url}/hello/world?time=now`)

  t.is(response, 'Hello world now')
})

test('routes with underline', async t => {
  const routes = router(get('/foo_bar', () => 'Hello with underline'))

  const url = await server(routes)
  const response = await request(`${url}/foo_bar`)

  t.is(response, 'Hello with underline')
})

test('async handlers', async t => {
  const hello = req =>
    Promise.resolve(`Hello ${req.params.msg} ${req.query.time}`)

  const routes = router(get('/hello/:msg', hello))

  const url = await server(routes)
  const response = await request(`${url}/hello/world?time=now`)

  t.is(response, 'Hello world now')
})

test('composed routes', async t => {
  const fooRouter = router(get('/foo', () => `Hello foo`))
  const barRouter = router(get('/bar', () => `Hello bar`))

  const routes = router(fooRouter, barRouter)

  const url = await server(routes)
  const fooResponse = await request(`${url}/foo`)
  const barResponse = await request(`${url}/bar`)

  t.is(fooResponse, 'Hello foo')
  t.is(barResponse, 'Hello bar')
})

test('multiple matching routes', async t => {
  const withPath = () => 'Hello world'
  const withParam = () => t.fail('Clashing route should not have been called')

  const routes = router(get('/path', withPath), get('/:param', withParam))

  const url = await server(routes)
  const reponse = await request(`${url}/path`)

  t.is(reponse, 'Hello world')
})

test('multiple matching async routes', async t => {
  const withPath = (req, res) => micro.send(res, 200, 'Hello world')
  const withParam = () => t.fail('Clashing route should not have been called')

  const routes = router(get('/path', withPath), get('/:param', withParam))

  const url = await server(routes)
  const reponse = await request(`${url}/path`)

  t.is(reponse, 'Hello world')
})

test('error without path and handler', t => {
  const fn = () => {
    router(get())
  }

  const error = t.throws(fn, Error)
  t.is(error.message, 'You need to set a valid path')
})

test('error without handler', t => {
  const fn = () => {
    router(get('/hey'))
  }

  const error = t.throws(fn, Error)
  t.is(error.message, 'You need to set a valid handler')
})

test('route which sends a Stream', async t => {
  const stream = new Readable()

  stream._read = () => {}
  stream.push('foo')
  stream.push(null)

  const routes = router(get('/', (req, res) => micro.send(res, 200, stream)))

  const url = await server(routes)
  const response = await request(url)

  t.is(response, 'foo')
})

test('route which sends a file stream', async t => {
  const stream = fs.createReadStream('./package.json')
  const routes = router(get('/', (req, res) => micro.send(res, 200, stream)))

  const url = await server(routes)
  const response = await request(url)
  const json = JSON.parse(response)

  t.is(json.name, 'microrouter')
})

test('passing UrlPattern instance as path argument', async t => {
  const pattern = new UrlPattern(/^\/api$/)
  const routes = router(get(pattern, () => 'with custom pattern'))

  const url = await server(routes)
  const response = await request(`${url}/api`)

  t.is(response, 'with custom pattern')
})

test('allow handlers returning null', async t => {
  const routes = router(get('/null', () => null))

  const url = await server(routes)
  const reponse = await request(`${url}/null`, {
    simple: false,
    resolveWithFullResponse: true,
  })

  t.not(reponse.statusCode, 404)
  t.not(reponse.body, 'Cannot GET /null')
})

test('routes with namespace', async t => {
  const fooRoutes = withNamespace('/foo')
  const barRoutes = withNamespace('/bar')

  const routes = router(
    fooRoutes(get('/test', () => 'foo')),
    barRoutes(get('/test', () => 'bar'))
  )

  const url = await server(routes)
  const fooResponse = await request(`${url}/foo/test`)
  const barResponse = await request(`${url}/bar/test`)

  t.is(fooResponse, 'foo')
  t.is(barResponse, 'bar')
})

test('route with namespace without trailing slash', async t => {
  const fooRoutes = withNamespace('/foo')

  const routes = router(fooRoutes(get('/', () => 'foo')))

  const url = await server(routes)
  const fooResponse = await request(`${url}/foo`)

  t.is(fooResponse, 'foo')
})

test('route with namespace with trailing slash', async t => {
  const fooRoutes = withNamespace('/foo')

  const routes = router(fooRoutes(get('/', () => 'foo')))

  const url = await server(routes)
  const fooResponse = await request(`${url}/foo/`)

  t.is(fooResponse, 'foo')
})
