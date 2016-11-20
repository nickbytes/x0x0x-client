'use strict'

var db = require('localforage')

var ws = require('./ws')
var notify = require('./notify')
var network = require('./network')

var feed = document.querySelector('#feed')
var saved = document.querySelector('#saved')
var savedEmpty = document.querySelector('#saved li.notice')
var savedItems = {}

// 1 second x 60 seconds x 60 minutes x 24 hours
var alive = 1000 * 60 * 60 * 24

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
    }
  }

  network.list(function (_, hosts) {
    var wsList = ws.list()

    for (var k in hosts) {
      k = k.split('://')[1]

      try {
        wsList[k].send(JSON.stringify({
          type: 'item.add',
          value: data
        }))
      } catch (err) {
        console.log('could not connect to ', k, err)
        msg.error = 'Could not share with network: ' + k
        notify(msg)
        return
      }
    }

    msg.notice = 'Shared your link to the network.'
    notify(msg)
  })
}

function save (btn, item) {
  var msg = {}
  db.setItem('saved', savedItems, function (err) {
    if (err) {
      msg.error = 'Could not save link'
      notify(msg)
    } else {
      btn.classList.add('saved')
      var li2 = generateLink(item, true)
      savedEmpty.classList.remove('active')
      if (saved.childNodes.length < 1) {
        saved.append(li2)
      } else {
        saved.prepend(li2)
      }
    }
  })
}

function unsave (id) {
  var msg = {}
  document.querySelector('#' + id).classList.add('deleted')
  delete savedItems[id.split('s-')[1]]
  if (saved.childNodes.length < 1) {
    savedEmpty.classList.add('active')
  }
  db.setItem('saved', savedItems, function (err) {
    if (err) {
      msg.error = 'Could not unsave this link. Refresh and try again?'
      notify(msg)
    }
  })
}

exports.list = function () {
  var msg = {}
  db.getItem('saved', function (err, items) {
    if (err) {
      msg.error = 'Could not retrieve saved links'
      notify(msg)
    } else {
      for (var k in items) {
        savedItems[k] = items[k]
        var li = generateLink(items[k], true)
        savedEmpty.classList.remove('active')
        saved.prepend(li)
      }
    }
  })
}

function generateLink (item, isSave) {
  var li = document.createElement('li')
  var msg = {}
  var btn

  if (isSave) {
    li.id = 's-' + item.id
    btn = document.createElement('button')
    btn.textContent = '✖'
    btn.onclick = function (ev) {
      ev.preventDefault()
      unsave(btn.parentNode.id)
    }
  } else {
    li.id = item.id
    btn = document.createElement('button')
    btn.textContent = '↯'
    btn.onclick = function () {
      if (!savedItems[item.id]) {
        savedItems[item.id] = item
        save(btn, item)
      } else {
        msg.error = 'You already saved this link.'
        notify(msg)
      }
    }
  }
  var p = document.createElement('p')
  p.classList.add('description')
  p.textContent = item.description
  var a = document.createElement('a')
  a.href = a.textContent = item.url
  li.appendChild(p)
  li.appendChild(a)
  li.appendChild(btn)
  return li
}

exports.display = function (result) {
  console.log('!!!!!!!!! ', result)
  if (typeof result !== 'object') {
    result = JSON.parse(result)
  }

  if (!result.value) {
    return
  }
  switch (result.type) {
    case 'item.add':
      console.log('item added ', result)
      break
    case 'item.feed':
      result = result.value
      console.log('++++++ ', result)
      result.forEach(function (r) {
        console.log('.... ', r)
        var item = {
          id: r.url.replace(/[^A-Z0-9]+/gi, ''),
          url: r.url,
          description: r.description
        }

        var li = document.querySelector('#' + item.id)
        if (li) {
          return
        }
        li = generateLink(item)
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
