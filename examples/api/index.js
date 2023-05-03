const express = require('express')
const app = express()
const path = require('path')

app.get(
  '*',
  express.static(path.join(__dirname, 'static'), {
    setHeaders,
  })
)

app.use((req, res, next) => {
  setHeaders(res)
  next()
})

app.listen(3000, () => {
  console.log('Example server is started at port 3000')
})

function setHeaders(res) {
  res.set('Access-Control-Allow-Origin', '*')
  res.set(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, PUT, PATCH, POST, DELETE'
  )
  res.set('Access-Control-Allow-Headers', '*')
  res.type('application/json')
}
