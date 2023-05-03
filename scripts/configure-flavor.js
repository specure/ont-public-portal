const ncp = require('ncp').ncp

function main() {
  const flavor = process.argv[2]

  if (!flavor) {
    return console.error('Please specify the flavor')
  }

  ;[
    {
      src: `./config/${flavor}/prerender-routes.txt`,
      dest: './src/prerender-routes.txt',
    },
    {
      src: `./config/${flavor}/index.html`,
      dest: './src/index.html',
    },
    {
      src: `./config/${flavor}/environments`,
      dest: './src/environments',
    },
    {
      src: `./config/${flavor}/assets/styles/_settings__theme.scss`,
      dest: './src/assets/styles/00-settings/_settings__theme.scss',
    },
    {
      src: `./config/${flavor}/assets/images`,
      dest: './src/assets/images',
    },
    {
      src: `./config/${flavor}/core/enums`,
      dest: './src/app/core/enums',
    },
  ].forEach((item) => {
    const { src, dest } = item
    ncp(src, dest, (err) => {
      if (err) {
        return console.error(err)
      }
      console.log(`${dest} is created.`)
    })
  })
}

main()
