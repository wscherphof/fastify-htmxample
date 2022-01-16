# fastify-htmxample

This repo aims to provide an example of a complete setup for an
[HTMX](https://htmx.org) app.

HTMX provides extensions for HTML, so that HTML content is really capable of
fullfilling the [Hypermedia As The Engine Of Application
State](https://en.wikipedia.org/wiki/HATEOAS) paradigm that the web was designed
for.

HTMX also features [Hyperscript]() to create additional client-side
interactions. In this repo, it's used in
[./views/secret.pug](./views/secret.pug) and in
[./views/app.pug](./views/app.pug).

We use [Fastify](https://www.fastify.io) as the [Node](https://nodejs.org)
backend (Fastify is "the new [Express](https://expressjs.com/)"), and
[Vite](https://vitejs.dev) as the "bundler" for the frontend.

## Run
1. Install [Node](https://nodejs.org)
1. Clone this repo
1. Open a terminal and `cd` into the clone's root
1. `npm install` to install all dependencies and build the Vite project
1. `npm run dev` to start the Fastify server.

Browse to http://localhost:3000 and see that it worked.

## Vite server
If you're going to make changes to the JavaScript project in the `vite`
derictory, you can avoid having to rebuild it every time, by starting the Vite
development server:
1. Open another terminal (keep Fastify running on port 3000 in the existing
   terminal)
1. `cd` to the `vite` folder
1. `npm run dev` to start the Vite server on port 3001

Change the browser URL to http://localhost:3001. Now the browser will "hot
reload" everything you change within the vite directory. Note that the Fastify
server also restarts on every change of a file in the repo.

## Demo
To demonstrate the setup, the app implements (not more than) a Register and
Login sequence. Anyone can sign up by submitting their email address, which is
stored in a database. Subsequently, an email is sent to that address, with a
link to the password form. On submit, the token that was in the emailed link is
verified, and the user record in the database is updated with a hash of the
password. With the response, an encrypted cookie is set, which will authenticate
the user on subsequent requests.

There's a live version running as an Azure App Service at
https://fastify-htmxample.azurewebsites.net/.

## Configure
To complete the intended functionality of the demo, you'd need the connection
details of an email box. Open `app.js` and modify the configuration of the
[fastify-mailer](https://github.com/coopflow/fastify-mailer) plugin. You can
enter a password in the code, or use an enivironment variable. For the
environment variable, stop the Fastify server (`Ctrl-C`), then enter e.g.
`export GMAIL_PASSWORD=xxxxxx` before you `npm run dev` again.

Now, when you click the Register or New Password buttons in your browser, and
submit an email addres, you should recieve an email with a link (containing an
encrypted token) to the form where you can create your password to sign in.

Note that if you connect to a Gmail account, you probably need to set it to
allow for "less secure apps".

## URLs

You'll notice that the URL in de browser changes on each action (e.g.
`/users/register`), even when the HTML document isn't actually replaced, but
only updated with partial HTML content, that is requested through
[Ajax](https://developer.mozilla.org/en-US/docs/Web/Guide/AJAX).

Still, shoud you hit the browser's refresh button (or copy the URL and paste it
in a new window), the complete HTML document is fetched, and partially updated
again with the content corresponding to the URL.

## Tools
Apart from HTMX, Hyperscript, Fastify and Vite, the main packages that make this
setup work, are:
1. [fastify-htmx](https://github.com/wscherphof/fastify-htmx), a Fastify plugin
   that arranges for:
   1. Serving the Vite build.
   1. Accepting Ajax requests (with cookies) from the Vite dev server.
   1. Serving the full document instead of the partial content when needed.
   1. HTMX utility functions as Fastify
      [decorators](https://www.fastify.io/docs/latest/Reference/Decorators/).
1. [dev-htmx](https://github.com/wscherphof/dev-htmx), the frontend complement
   of fastify-htmx, to:
   1. Enable HTMX and Hyperscript.
   1. Direct Ajax requests to the Fastify server while the page is served by the
      Vite dev server.
   1. Pass URL query parameters and cookies along with the Ajax requests.

   Note that while we use Vite as the bundler in this repo, the dev-htmx package
   is not bound to it; you could replace Vite with any alternative that knows
   how to `import` things.

### Template engine
We use [point-of-view](https://github.com/fastify/point-of-view) to load the
[pug](https://pugjs.org) engine to dynamically render parametrised HTML. But
again: you're free to make different choices.

From pug, we use
[pug-material-design](https://github.com/wscherphof/pug-material-design) (still
far from complete) to render [Material Design
Components](https://material.io/develop/web). It's also imported client-side, to
instantiate the JavaScript objects needed. There, it makes some special
arrangements to make sure this also happens on the HTMX partial content loads.

The `.pug` files are in the `views` directory. As an extension, you can use `!=
include('template')` to dynamically include a child template.

## New project
To create a new project like this repo, take the following steps:
1. Install [fastify-cli](https://github.com/fastify/fastify-cli): `npm install
   fastify-cli --global`
1. `fastify generate <yourapp>`
1. `cd <yourapp>`
1. `npm install`
1. `npm install fastify-htmx`
1. Edit `app.js` to register the plugin:
   `fastify.register(require('fastify-htmx'))`
1. Optionally `npm install pug-material-design` and
   `fastify.register(require('pug-material-design/fastify'))`
1. Edit `routes/root.js` to change the `get('/')` to `get('/app')`
1. `npm init vite@latest vite` - choose vanilla or vanilla-ts (for TypeScript)
1. `cd vite`
1. `npm install`
1. `npm install dev-htmx`
1. Edit `index.html` to include the following attributes on the `<div id="app">`
   element:
    1. `hx-get="/app"`
    1. `hx-trigger="load delay:100ms"`
1. Edit `main.js` to add the following imports:
    1. `import 'dev-htmx'`
    1. Optionally `import 'pug-material-design'`
1. `npm run build`
1. `cd ..`
1. `npm run dev` to start Fastify on port 3000
1. Optionally, in another terminal, in the vite directory: `npm run dev` to
   start the Vite server on port 3001

# Getting Started with Fastify-CLI [Fastify-CLI](https://www.npmjs.com/package/fastify-cli)
This project was bootstrapped with Fastify-CLI.

## Available Scripts

In the project directory, you can run:

### `npm run dev`

To start the app in dev mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm start`

For production mode

### `npm run test`

Run the test cases.

## Learn More

To learn Fastify, check out the [Fastify
documentation](https://www.fastify.io/docs/latest/).
