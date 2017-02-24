const listen = require('test-listen')
const micro = require('micro')
const test = require('ava')
const got = require('got')

const { router, get } = require('./')

const server = fn => listen(micro(fn))

test('diferent routes', async t => {
  const routes = router(
    get('/foo', () => ({ name: 'foo' })),
    get('/bar', () => ({ name: 'bar' }))
  )

  const url = await server(routes)
  const fooGet = await got(`${url}/foo`)
  const barGet = await got(`${url}/bar`)

  t.is(JSON.parse(fooGet.body).name, 'foo')
  t.is(JSON.parse(barGet.body).name, 'bar')
})

test('routes with params and query', async t => {
  const hello = req => `Hello ${req.params.msg} ${req.query.time}`

  const routes = router(
    get('/hello/:msg', hello)
  )

  const url = await server(routes)
  const { body } = await got(`${url}/hello/world?time=now`)

  t.is(body, 'Hello world now')
})

test('async handlers', async t => {
  const hello = async req =>
    await Promise.resolve(`Hello ${req.params.msg} ${req.query.time}`)

  const routes = router(
    get('/hello/:msg', hello)
  )

  const url = await server(routes)
  const { body } = await got(`${url}/hello/world?time=now`)

  t.is(body, 'Hello world now')
})
