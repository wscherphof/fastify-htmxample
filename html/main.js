import './style.scss'
import 'htmx.org'
import { MDCRipple } from '@material/ripple'

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.mdc-button')
    .forEach((button) => new MDCRipple(button))
})

htmx.on('htmx:configRequest', function (evt) {
  if (window.location.host.startsWith('localhost') && evt.detail.path.startsWith('/')) {
    // vite dev server proxy to fastify
    evt.detail.path = '/api' + evt.detail.path
  }
})

document.querySelector('#app').innerHTML = `
  <h1>Hello Vite!</h1>
  <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
`
