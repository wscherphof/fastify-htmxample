import './style.css'
import 'htmx.org/dist/htmx.js';

htmx.on("htmx:configRequest", function (evt) {
  if (location.host === "localhost:3000" && evt.detail.path.startsWith("/")) {
    evt.detail.path = "http://localhost:3001" + evt.detail.path;
  }
});

document.querySelector('#app').innerHTML = `
  <h1>Hello Vite!</h1>
  <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
`
