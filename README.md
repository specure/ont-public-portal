# ONT Public Portal

## Setup

The folder `config` can contain files specific for different flavors, such as images, styles, templates. `config/environments` folder should contain `*.json` files with settings for various environments, such as dev, beta, etc. You can set there such things, as the URLs of your control server and CMS, Mapbox IDs and so on. It contains an example `environment.json`, which will be used when running the app in the debug mode.

To configure the project for a certain flavor run:

```
    npm run configure -- ${flavor}
```

## Running

To run in the debug mode using the dev server use:

```
    npm run start
```

`npm run start-stage` and `npm run start-prod` are also available.

## Building

To build the app for production use:

```
    npm run build-prod
```

`npm run build-dev` is also available.

## Pre-rendering

To pre-render pages, to server them statically from your server, you can specify their routes in `config/<YOUR_FLAVOR>/prerender-routes.txt`, then run:

```
    npm run configure <YOUR_FLAVOR> && npm run prerender:prod
```

`npm run prerender:dev` and `npm run prerender:beta` are also available.
