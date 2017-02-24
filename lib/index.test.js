const listen = require('test-listen')
const micro = require('micro')
const test = require('ava')
const request = require('request-promise')

const { router, get } = require('./')

const server = fn => listen(micro(fn))

test('diferent routes', async t => {
  const routes = router(
    get('/foo', () => ({ name: 'foo' })),
    get('/bar', () => ({ name: 'bar' }))
  )

  const url = await server(routes)
  const fooGet = await request.get(`${url}/foo`)
  const barGet = await request.get(`${url}/bar`)

  t.is(JSON.parse(fooGet).name, 'foo')
  t.is(JSON.parse(barGet).name, 'bar')
})

test('routes with params and query', async t => {
  const hello = req => `Hello ${req.params.msg} ${req.query.time}`

  const routes = router(
    get('/hello/:msg', hello)
  )

  const url = await server(routes)
  const message = await request.get(`${url}/hello/world?time=now`)

  t.is(message, 'Hello world now')
})

test('async handlers', async t => {
  const hello = async req =>
    await Promise.resolve(`Hello ${req.params.msg} ${req.query.time}`)

  const routes = router(
    get('/hello/:msg', hello)
  )

  const url = await server(routes)
  const message = await request.get(`${url}/hello/world?time=now`)

  t.is(message, 'Hello world now')
})
