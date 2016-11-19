'use strict'

var item = require('./item')

var ws = {}

exports.reconnect = function (network) {
  console.log('reconnecting ', network)
  try {
    var host = network.split('://')
    var protocol = host[0]

    ws[host[1]] = new window.WebSocket('ws' + (protocol === 'https' ? 's' : '') + '://' + host[1])
    ws[host[1]].onerror = function () {
      console.log('could not connect to ', host[1])
    }
    ws[host[1]].onmessage = function (data) {
      item.display(JSON.parse(data.data))
    }
  } catch (err) {
    console.log(err)
  }
}

exports.list = function () {
  return ws
}
