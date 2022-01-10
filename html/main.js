import './style.scss'
import 'htmx.org' // htmx from or { htmx } from don't work
import 'https://unpkg.com/hyperscript.org@0.9.3' // not yet on npm
import { MDCRipple } from '@material/ripple'
import { MDCIconButtonToggle } from '@material/icon-button'
import { MDCTextField } from '@material/textfield';

htmx.on('htmx:configRequest', function ({ detail }) { // eslint-disable-line
  // <div id="app" hx-get="/app" hx-trigger="load"></div>
  if (detail.path === '/app' && window.location.pathname !== '/') {
    detail.path = window.location.pathname
  }
  if (window.location.host.startsWith('localhost:3001') && detail.path.startsWith('/')) {
    // vite dev server proxy to fastify
    detail.path = '/api' + detail.path
  }
})

htmx.on('htmx:load', function ({ detail }) { // eslint-disable-line
  function init(classes, init) {
    classes = classes instanceof Array ? classes : [classes]
    const { elt } = detail;
    classes.forEach((className) => {
      if (elt.classList.contains(className)) {
        init(elt, className)
      }
      elt.querySelectorAll('.' + className).forEach((elt) => {
        init(elt, className)
      })
    })
  }
  init(['mdc-button', 'mdc-icon-button'], (elt, className) => {
    const ripple = new MDCRipple(elt)
    if (className === 'mdc-icon-button') {
      ripple.unbounded = true
      if (elt.getAttribute('toggle')) {
        const iconToggle = new MDCIconButtonToggle(elt)
        iconToggle.listen('MDCIconButtonToggle:change', (event) => {
          elt.dispatchEvent(event)
        })
      }
    }
  })
  init('mdc-text-field', (elt, className) => {
    return new MDCTextField(elt)
  })
})
