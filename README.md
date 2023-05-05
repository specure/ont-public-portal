# ONT Public Portal

## Setup

The folder `config` is meant to contain files specific for different flavors, such as images, styles, templates. `config/<YOUR_FLAVOR>/environments` folder is meant to contain `*.json` files with settings for various environments, e.g. dev, beta, etc. You can set there the URLs of your control server and CMS, Mapbox IDs and so on. `config/nettest/environments` contains an example `environment.json`, which will be used when running the app in the debug mode.

To configure the project for a certain flavor run:

```
    npm run configure -- <YOUR_FLAVOR>
```

## Running

The portal depends on the control server for running tests and keeping history of results. Its code is published separately at https://github.com/specure.

The portal uses a CMS to display such things as menus and texts. Any headless CMS can be used for this purpose (e.g. Strapi or Wordpress with the headless plugin), as long as its responses are formatted correctly. The folder `examples/api` contains a simple server, providing example responses for some of the CMS endpoints used by the portal. You can run this server by calling:

```
    node examples/api
```

All the endpoints used by the portal are listed in the `config/nettest/environments/environment.ts` under `cms.routes` and `controlServer.routes` sections.

The portal uses Mapbox to display the map with the measurement data. See https://docs.mapbox.com/studio-manual/guides/ and https://docs.mapbox.com/mapbox-gl-js/guides/ for the official documentation. HERE API is also used, for search and geocoding, https://developer.here.com/documentation/geocoding-search-api/dev_guide/index.html. The section `map` in the `config/nettest/environments/environment.ts` contains all the required settings.

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

To pre-render pages, to serve them statically later, you can specify their routes in `config/<YOUR_FLAVOR>/prerender-routes.txt`, then run:

```
    npm run configure -- <YOUR_FLAVOR> && npm run prerender:prod
```

`npm run prerender:dev` and `npm run prerender:beta` are also available.

## Testing

You have to set up the portal with the control server, the CMS, and the map before running tests. Once it's done, start the app and launch:

```
    npm run configure-playwright-dev
```

in parallel, to configure the environment for the test suite. Then use:

```
    npm run test
```

or

```
    npm run test-headless
```

to run all the avaialable tests.
