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

test('routes with underline', async t => {
  const routes = router(
    get('/foo_bar', () => 'Hello with underline')
  )

  const url = await server(routes)
  const response = await request(`${url}/foo_bar`)

  t.is(response, 'Hello with underline')
})

test('async handlers', async t => {
  const hello = req =>
    Promise.resolve(`Hello ${req.params.msg} ${req.query.time}`)

  const routes = router(
    get('/hello/:msg', hello)
  )

  const url = await server(routes)
  const response = await request(`${url}/hello/world?time=now`)

  t.is(response, 'Hello world now')
})

test('composed routes', async t => {
  const fooRouter = router(
    get('/foo', () => `Hello foo`)
  )

  const barRouter = router(
    get('/bar', () => `Hello bar`)
  )

  const routes = router(
    fooRouter,
    barRouter
  )

  const url = await server(routes)
  const fooResponse = await request(`${url}/foo`)
  const barResponse = await request(`${url}/bar`)

  t.is(fooResponse, 'Hello foo')
  t.is(barResponse, 'Hello bar')
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
