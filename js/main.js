'use strict'

var item = require('./item')
var network = require('./network')
var ws = require('./ws')

var formItem = document.querySelector('#form-item')
var formNetwork = document.querySelector('#form-network')

var headerTabs = document.querySelectorAll('header h2')
var trios = document.querySelectorAll('.trio')
var notify = document.querySelector('#notify')

notify.onclick = function () {
  notify.classList.remove('active')
}

ws.reconnect()
item.list()
network.list(function (_, hosts) {
  network.setNetwork(hosts)
  network.redraw()
})

formItem.onsubmit = function (ev) {
  ev.preventDefault()

  var inputs = this.querySelectorAll('input')
  item.add(inputs)
}

formNetwork.onsubmit = function (ev) {
  ev.preventDefault()

  network.add(formNetwork.querySelector('input').value)
}

// header setup

headerTabs.forEach(function (tab) {
  tab.onclick = function () {
    selectTab(this.id.split('-')[1])
  }
})

function selectTab (name) {
  headerTabs.forEach(function (tab) {
    tab.classList.remove('active')
  })

  var selected = document.querySelector('#tab-' + name)
  selected.classList.add('active')

  trios.forEach(function (trio) {
    trio.classList.remove('active')
  })

  var selectedTrio = document.querySelector('.' + name + '-wrapper')
  selectedTrio.classList.add('active')
}

selectTab('feed')
