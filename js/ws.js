'use strict'

var db = require('localforage')

var item = require('./item')
var net = require('./network')

var ws = {}

exports.reconnect = function () {
  function connect (network) {
    try {
      console.log('reconnecting ', network)
      var host = network.split('://')
      var protocol = host[0]

      ws[host[1]] = new window.WebSocket('ws' + (protocol === 'https' ? 's' : '') + '://' + host[1])
      ws[host[1]].onerror = function () {
        console.log('could not connect to ', host[1])
      }

      ws[host[1]].onopen = function () {
        ws[host[1]].send(JSON.stringify({
          type: 'item.feed'
        }))

        ws[host[1]].onmessage = function (data) {
          data = JSON.parse(data.data)
          item.display(data)
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  db.getItem('network', function (err, n) {
    if (!err && n) {
      net.setNetwork(n)
      for (var k in n) {
        connect(k)
      }
    }
  })
}

exports.list = function () {
  return ws
}
