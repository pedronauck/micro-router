const test = require('ava')

const { getParamsAndQuery } = require('./')

test('getParamsAndQuery()', t => {
  const path = '/hello/:msg'
  const url = '/hello/world?id=0'

  const { params, query } = getParamsAndQuery(path, url)

  t.deepEqual(params, { msg: 'world' })
  t.deepEqual(query, { id: '0' })
})
