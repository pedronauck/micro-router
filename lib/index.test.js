const test = require('ava')
const micro = require('micro')
const listen = require('test-listen')
const request = require('request-promise')

const { router, get } = require('./')

const server = fn => listen(micro(fn))

test('diferent routes', async t => {
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

  const routes = router(
    get('/hello/:msg', hello)
  )

  const url = await server(routes)
  const response = await request(`${url}/hello/world?time=now`)

  t.is(response, 'Hello world now')
})

test('async handlers', async t => {
  const hello = async req =>
    await Promise.resolve(`Hello ${req.params.msg} ${req.query.time}`)

  const routes = router(
    get('/hello/:msg', hello)
  )

  const url = await server(routes)
  const response = await request(`${url}/hello/world?time=now`)

  t.is(response, 'Hello world now')
})

test('default 404 handler', async t => {
  const hello = () => 'Hello world'

  const routes = router(
    get('/hello', hello)
  )

  const url = await server(routes)
  const helloResponse = await request(`${url}/hello`)
  t.is(helloResponse, 'Hello world')

  const notfoundResponse = await request(`${url}/api`, {
    simple: false,
    resolveWithFullResponse: true
  })
  t.is(notfoundResponse.statusCode, 404)
  t.is(notfoundResponse.body, 'Cannot GET /api')
})

test('custom 404 handler', async t => {
  const hello = () => 'Hello world'
  const notfound = () => 'Not found'

  const routes = router(
    get('/hello', hello),
    get('/*', notfound)
  )

  const url = await server(routes)
  const helloResponse = await request(`${url}/hello`)
  const notfoundResponse = await request(`${url}/api`)

  t.is(helloResponse, 'Hello world')
  t.is(notfoundResponse, 'Not found')
})

test('multiple matching routes', async t => {
  const withPath = () => 'Hello world'
  const withParam = () => t.fail('Clashing route should not have been called')

  const routes = router(
    get('/path', withPath),
    get('/:param', withParam)
  )

  const url = await server(routes)
  const pathResponse = await request(`${url}/path`)

  t.is(pathResponse, 'Hello world')
})

test('multiple matching async routes', async t => {
  const withPath = (req, res) => micro.send(res, 200, 'Hello world')
  const withParam = () => t.fail('Clashing route should not have been called')

  const routes = router(
    get('/path', withPath),
    get('/:param', withParam)
  )

  const url = await server(routes)
  const pathResponse = await request(`${url}/path`)

  t.is(pathResponse, 'Hello world')
})

test('error without path and handler', async t => {
  const fn = () => {
    router(get())
  }

  const error = t.throws(fn, Error)
  t.is(error.message, 'You need to set a valid path')
})

test('error without handler', async t => {
  const fn = () => {
    router(get('/hey'))
  }

  const error = t.throws(fn, Error)
  t.is(error.message, 'You need to set a valid handler')
})

test('allow handlers returning null', async t => {
  const routes = router(
    get('/null', () => null),
  )

  const url = await server(routes)
  const pathResponse = await request(`${url}/null`, {
    simple: false,
    resolveWithFullResponse: true
  })

  t.not(pathResponse.statusCode, 404)
  t.not(pathResponse.body, 'Cannot GET /null')
})
