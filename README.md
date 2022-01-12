# fastify-htmxample

This repo aims to provide an example of a complete setup for an
[HTMX](https://htmx.org) app.

[HTMX](https://htmx.org) provides extensions for HTML, so that HTML content is
really capable of fullfilling the [Hypermedia As The Engine Of Application
State](https://en.wikipedia.org/wiki/HATEOAS) paradigm that the web was designed
for.

HTMX also features [Hyperscript]() to create additional client-side
interactions. It's enabled in this repo as well. Examples of its use will be
added soon.

We use [Fastify](https://www.fastify.io) as the [Node](https://nodejs.org)
backend (Fastify is "the new [Express](https://expressjs.com/)"), and
[Vite](https://vitejs.dev) as the "bundler" for the frontend.

## Run
1. Install [Node](https://nodejs.org)
1. Clone this repo
1. `cd` into the clone's root
1. run `npm install`
1. `cd vite`
1. `npm install`
1. `npm run build` to build the Vite distribution
1. `cd ..` back to the root
1. `npm run dev` to start the Fastify server Browse to http://localhost:3000 ans
   see that it worked. Click on any of the initial buttons, and on your
   browser's Back button, but do not submit any of the resulting forms yet.

## Configure
You'll need the connection details of an email box; maybe you'll want to use an
account on [outlook.com](https://outlook.live.com). Open `app.js` and modify the
configuration of the
[fastify-mailer](https://github.com/coopflow/fastify-mailer) plugin. You can
enter a password in the code, or use an enivironment variable. For the
environment variable, stop the Fastify server (`Ctrl-C`), then enter e.g.
`export OUTLOOK_PASSWORD=xxxxxx` before you `npm run dev` again.

Now, when you click the Register button in your browser, and submit an email
addres, you should recieve an email with a link (containing an encrypted token)
to the form where you can create your password to sign in.

## Vite server
If you're going to make changes in the `vite` folder, you can avoid rebuilding
every time by starting the Vite development server:
1. Open another terminal (keep Fastify running on post 3000 in the existing
   terminal)
1. `cd` to the `vite` folder
1. `npm run dev` to start the Vite server on port 3001 Change the browser URL to
   http://localhost:3001 Now the browser will "hot reload" everything you change
   within the vite directory. Note that the Fastify server alse restarts on
   every change of a file in the repo.

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
