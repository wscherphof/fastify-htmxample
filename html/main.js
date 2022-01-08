import './style.scss'
import 'htmx.org' // htmx from or { htmx } from don't work
import 'https://unpkg.com/hyperscript.org@0.9.3' // not yet on npm
import { MDCRipple } from '@material/ripple'
import { MDCIconButtonToggle } from '@material/icon-button'

htmx.on('htmx:configRequest', function ({ detail }) { // eslint-disable-line
  if (detail.path === '/') { // since <div id="app" hx-get="/" hx-trigger="load"></div>
    const { searchParams } = new URL(window.location.href)
    const path = searchParams.get('path')
    if (path) {
      detail.path = decodeURIComponent(path)
    }
  }
  if (window.location.host.startsWith('localhost') && detail.path.startsWith('/')) {
    // vite dev server proxy to fastify
    detail.path = '/api' + detail.path
  }
})

htmx.on('htmx:load', function ({ detail }) { // eslint-disable-line
  const { elt } = detail;
  ['mdc-button', 'mdc-icon-button'].forEach((buttonClass) => {
    if (elt.classList.contains(buttonClass)) {
      init(elt)
    }
    elt.querySelectorAll('.' + buttonClass).forEach((button) => {
      init(button)
    })
    function init(button) {
      const ripple = new MDCRipple(button)
      if (buttonClass === 'mdc-icon-button') {
        ripple.unbounded = true
        if (button.getAttribute('toggle')) {
          const iconToggle = new MDCIconButtonToggle(button)
          iconToggle.listen('MDCIconButtonToggle:change', (event) => {
            button.dispatchEvent(event)
          })
        }
      }
    }
  })
})
