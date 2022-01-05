import './style.css'
import 'htmx.org/dist/htmx.js';

htmx.on("htmx:configRequest", function (evt) {
  if (location.host.startsWith("localhost") && evt.detail.path.startsWith("/")) {
    // vite dev server proxy to fastify
    evt.detail.path = "/api" + evt.detail.path;
  }
});

document.querySelector('#app').innerHTML = `
  <h1>Hello Vite!</h1>
  <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
`
