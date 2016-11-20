'use strict'

var db = require('localforage')

var notify = require('./notify')
var ws = require('./ws')
var item = require('./item')

var network = {}
var networkList = document.querySelector('#network')

function remove (host) {
  delete network[host]

  var msg = {}

  db.setItem('network', network, function (err) {
    if (err) {
      msg.error = err
    } else {
      msg.notice = host
      exports.redraw()
    }
    notify(msg)
  })
}

exports.setNetwork = function (n) {
  network = n
}

exports.redraw = function () {
  networkList.innerHTML = ''
  console.log('networks : ', network)
  for (var k in network) {
    var n = document.createElement('li')
    n.textContent = k
    console.log(k)
    n.id = 'network-' + k.replace(/^\w+/gi, '')
    var btn = document.createElement('button')
    btn.textContent = '✖'
    btn.onclick = function (ev) {
      ev.preventDefault()
      remove(k)
    }
    n.appendChild(btn)
    networkList.appendChild(n)
  }
}

exports.add = function (host) {
  var msg = {}

  if (!host.match(/^http/)) {
    msg.error = 'Invalid URL for host'
    notify(msg)
    return
  }

  db.getItem('network', function (err, n) {
    if (!err && n) {
      network = n
    } else {
      network = {}
    }

    host = host.replace(/\/$/, '')
    network[host] = new Date().getTime()

    db.setItem('network', network, function (err) {
      if (err) {
        msg.error = 'Could not save host: ' + err
      } else {
        msg.notice = 'Added host ' + host
        exports.redraw()
      }
      notify(msg)
    })
  })
}

exports.list = function (next) {
  db.getItem('network', function (err, n) {
    if (!err && n) {
      network = n
    }

    next(null, network)
  })
}
