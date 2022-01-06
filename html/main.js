import './style.scss'
import 'htmx.org' // htmx from or { htmx } from don't work
import 'https://unpkg.com/hyperscript.org@0.9.3' // not yet on npm
import { MDCRipple } from '@material/ripple'

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.mdc-button')
    .forEach((button) => new MDCRipple(button))
})

htmx.on('htmx:configRequest', function ({ detail }) { // eslint-disable-line
  if (window.location.host.startsWith('localhost') && detail.path.startsWith('/')) {
    // vite dev server proxy to fastify
    detail.path = '/api' + detail.path
  }
})

htmx.on('htmx:load', function ({ detail }) { // eslint-disable-line
  const { elt } = detail
  const buttonClass = 'mdc-button'
  if (elt.classList.contains(buttonClass)) {
    ripple(elt)
  }
  elt.querySelectorAll('.' + buttonClass).forEach((button) => {
    ripple(button)
  })
  function ripple (button) {
    return new MDCRipple(button)
  }
})
