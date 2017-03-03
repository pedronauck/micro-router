const test = require('ava')
const micro = require('micro')
const listen = require('test-listen')
const request = require('request-promise')

const { router, get, post } = require('./')

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

test('not found route', async t => {
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

test('body request', async t => {
  const hello = req => `Hello ${req.body.who}`

  const routes = router(
    post('/hello', hello)
  )

  const body = { who: 'world' }

  const url = await server(routes)
  const response = await request.post(`${url}/hello`, { body, json: true })

  t.is(response, 'Hello world')
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
