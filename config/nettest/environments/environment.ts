// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  baseUrl: 'http://localhost:4200',
  deployedUrl: 'https://dev.example.com',
  availableLangs: [
    { iso: 'en', name: 'English' },
    { iso: 'de', name: 'Deutsch' },
  ],
  defaultLang: 'en',
  cms: {
    headers: {
      'Content-Type': 'application/json',
    },
    projectSlug: 'nt',
    type: 'strapi',
    url: 'http://localhost:3000',
    routes: {
      articles: '/articles',
      export: '/export',
      exportQueue: '/exportQueue',
      feedback: '/feedback',
      menus: '/menus.json',
      municipalities: '/municipalities',
      translations: '/translations.json',
      images: '/images',
      clearExport: '/clearExport',
      cookiesProject: '/cookies/project',
      cookieConsents: '/cookie-consents',
      pages: '/pages.json',
      pagesProject: '/pages/project',
      projects: '/projects.json',
      scheduleExport: '/scheduleExport',
      uploads: '/uploads',
      versions: '/versions.json',
    },
  },
  controlServer: {
    headers: {
      'Content-Type': 'application/json',
      'X-example-Client': 'nt',
    },
    url: 'https://dev.example.org',
    routes: {
      providers: '/nationalTable',
      history: '/reports/basic/history',
      result: '/measurementResult',
      measurementServer: '/measurementServer',
      settings: '/settings',
    },
  },
  cookieWidget: {
    theme: {
      backgroundColor: '#ffffff',
      buttonColor: '#0958BD',
      disabledSwitchColor: '#0958BD',
      disabledSwitchButtonColor: '#b1c4db',
      dropdownColor: '#0958BD',
      linkColor: '#0958BD',
      textColor: '#000000',
    },
  },
  countriesUrl: 'https://restcountries.com/v3.1/all?fields=name,flag,cca2',
  production: false,
  projectTitle: 'Nettest',
  logo: {
    header: '/assets/images/logo-header.svg',
    headerSide: null,
    footer: '/assets/images/logo-footer.svg',
    map: null,
  },
  map: {
    accessToken: null,
    attribution:
      '© <a href="https://www.mapbox.com/about/maps/" title="Mapbox is a mapping platform for everyone">Mapbox</a>',
    center: [-92.5, 37.5],
    styleId: null,
    ispStyleId: null,
    url: 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
    zoom: 4,
    countiesMaxZoom: 5,
    geocoding: {
      url:
        'https://geocode.search.hereapi.com/v1/geocode' +
        '?q={query}' +
        '&at={center}' +
        '&in=countryCode:USA' +
        '&limit=10' +
        '&apiKey=',
    },
    municipalitiesMaxZoom: 7.5,
    hexagons10kmMaxZoom: 10,
    hexagons1kmMaxZoom: 12,
    hexagons01kmMaxZoom: 14,
  },
  municipality: {
    mapLayout: 'horizontal',
    forTesting: {
      name: 'Oslo',
      code: '0301',
      website: 'https://www.oslo.kommune.no',
    },
  },
  robotsMayIndex: false,
  recaptchaSiteKey: null,
  versionName: 'ont-public-portal',
}

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
