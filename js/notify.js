'use strict'

var notification = document.querySelector('#notify')

module.exports = function (msg) {
  notification.classList.remove('error')
  notification.classList.add('active')

  if (msg.error) {
    notification.classList.add('error')
    notification.textContent = msg.error
  } else if (msg.notice) {
    notification.textContent = msg.notice
  } else {
    notification.textContent = ''
  }

  setTimeout(function () {
    notification.classList.remove('active')
  }, 5000)
}
