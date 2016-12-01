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
        ws[host[1]].close()
      }

      ws[host[1]].onopen = function () {
        ws[host[1]].send(JSON.stringify({
          type: 'item.feed'
        }))

        ws[host[1]].onmessage = function (data) {
          console.log('incoming ', data)
          data = JSON.parse(data.data)
          item.display(data)
        }
      }

      ws[host[1]].onclose = function () {
        console.log('reconnecting to', network)
        setTimeout(function () {
          connect(network)
        }, 1500)
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
