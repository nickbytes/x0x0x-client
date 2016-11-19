'use strict'

var db = require('localforage')

var ws = require('./ws')
var notify = require('./notify')
var network = require('./network')

var feed = document.querySelector('#feed')
var saved = document.querySelector('#saved')
var savedItems = {}

exports.add = function (inputs) {
  var data = {}
  var msg = {}

  for (var i = 0; i < inputs.length; i++) {
    var update = false
    switch (inputs[i].name) {
      case 'url':
        if (inputs[i].value.match(/^http/)) {
          inputs[i].value = inputs[i].value.replace(/\/$/, '')
          update = true
        } else {
          msg.error = 'Cannot add `' + inputs[i].value + '`\n' +
                      'Invalid URL format'
          notify(msg)
        }
        break
      default:
        update = true
        break
    }

    if (update) {
      data[inputs[i].name] = inputs[i].value
      inputs[i].value = ''
      inputs[i].checked = ''
      msg.notice = 'Shared your link to the network'
      notify(msg)
    }
  }

  network.list(true, function (_, hosts) {
    var wsList = ws.list()

    for (var k in hosts) {
      let m = k.split('://')[1]

      wsList[m].send(JSON.stringify({
        type: 'item.add',
        value: data
      }))

      if (!wsList[m]) {
        ws.reconnect(m)
      }
    }
    console.log('reconnecting after adding')
  })
}

var savedEmpty = document.querySelector('#saved li.notice')

exports.list = function () {
  var msg = {}
  db.getItem('saved', function (err, items) {
    if (err) {
      msg.error = 'Could not retrieve saved links'
      notify(msg)
    } else {
      var li

      if (items) {
        savedEmpty.classList.remove('active')
      }

      for (var k in items) {
        savedItems[k] = items[k]
        li = generateLink(items[k])
        if (saved.childNodes.length < 1) {
          saved.append(li)
        } else {
          saved.prepend(li)
        }
      }

      if (saved.childNodes.length < 1) {
        savedEmpty.classList.add('active')
      }
    }
  })
}

function generateLink (item) {
  var li = document.createElement('li')
  var p = document.createElement('p')
  p.classList.add('description')
  p.textContent = item.description
  var a = document.createElement('a')
  a.href = a.textContent = item.url
  li.appendChild(p)
  li.appendChild(a)
  return li
}

exports.display = function (result) {
  var msg = {}

  switch (result.type) {
    case 'item.add':
      console.log('item added ', result)
      break
    case 'item.feed':
      result = result.value
      result.forEach(function (r) {
        var item = {
          id: r.url.replace(/[^A-Z0-9]+/gi, ''),
          url: r.url,
          description: r.description
        }

        var li = generateLink(item)
        var btn = document.createElement('button')
        btn.textContent = '↯'
        btn.onclick = function () {
          if (!savedItems[item.id]) {
            savedItems[item.id] = item
            db.setItem('saved', savedItems, function (err) {
              if (err) {
                msg.error = 'Could not save link'
                notify(msg)
              } else {
                btn.classList.add('saved')
                var li2 = generateLink(item)
                if (saved.childNodes.length < 1) {
                  saved.append(li2)
                } else {
                  saved.prepend(li2)
                }
                savedEmpty.classList.remove('active')
              }
            })
          } else {
            msg.error = 'You have saved this link already.'
            notify(msg)
          }
        }

        li.appendChild(btn)
        if (feed.childNodes.length < 1) {
          feed.append(li)
        } else {
          feed.prepend(li)
        }
      })
      break
    default:
      break
  }
}
