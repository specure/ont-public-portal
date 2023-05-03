# ONT Public Portal

## Setup

The folder `config` can contain files specific for different flavors, such as images, styles, templates. `config/environments` folder is to contain `*.json` files with settings for various environments, such as dev, beta, etc. You can set there such things, as the URLs of your control server and CMS, Mapbox IDs and so on. It contains an example `environment.json`, which will be used when running the app in the debug mode.

To configure the project for a certain flavor run:

```
    npm run configure -- ${flavor}
```

## Running

The portal depends on a CMS to display such things as menus and texts. Any headless CMS can be used for this purpose (e.g. Strapi or Wordpress with the headless plugin), as long as its responses are formatted correctly. The folder `examples/api` contains a simple server, providing example responses for some of the CMS endpoints used by the portal. All the endpoints are listed in the `config/nettest/environments/environment.ts`. You can run this server by calling:

```
    node examples/api
```

The portal also depends on the control server for running tests and keeping history of results. It is published separately at https://github.com/specure.

The portal uses Mapbox to display the map with the measurement data. See https://docs.mapbox.com/studio-manual/guides/ and https://docs.mapbox.com/mapbox-gl-js/guides/ for the official documentation.

To run the app itself in the debug mode call:

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
