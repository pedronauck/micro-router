const test = require('ava')
const micro = require('micro')
const listen = require('test-listen')
const request = require('request-promise')

const { getParamsAndQuery, parseBody } = require('./')

const server = fn => listen(micro(fn))

test('getParamsAndQuery()', t => {
  const path = '/hello/:msg'
  const url = '/hello/world?id=0'

  const { params, query } = getParamsAndQuery(path, url)

  t.deepEqual(params, { msg: 'world' })
  t.deepEqual(query, { id: '0' })
})

test('parseBody()', async t => {
  const url = await server(async (req, res) => {
    const body = await parseBody(req)
    micro.send(res, 200, body)
  })

  const body = { foo: 'bar' }
  const response = await request.post(url, { body, json: true })

  t.deepEqual(response, body)
})
