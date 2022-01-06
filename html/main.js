import './style.scss'
import 'htmx.org' // htmx from or { htmx } from don't work
import { MDCRipple } from '@material/ripple'

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.mdc-button')
    .forEach((button) => new MDCRipple(button))
})

// standard(no-undef)
htmx.on('htmx:configRequest', function (evt) { // eslint-disable-line
  if (window.location.host.startsWith('localhost') && evt.detail.path.startsWith('/')) {
    // vite dev server proxy to fastify
    evt.detail.path = '/api' + evt.detail.path
  }
})

document.querySelector('#app').innerHTML = `
  <h1>Hello Vite!</h1>
  <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
`
