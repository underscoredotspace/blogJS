'use strict'
require('dotenv').config()
const db = require('./db')
db.connect()

const express = require('express')
const app = express()

app.use(
  express.static('app/client/build'),
  express.static('app/client/view')
)
app.use('/lib', 
  express.static('node_modules/angular'),
  express.static('node_modules/angular-cookies'),
  express.static('node_modules/angular-route'),
  express.static('node_modules/angular-sanitize'),
  express.static('node_modules/showdown/dist'),
  express.static('node_modules/ng-showdown/dist'),
  express.static('node_modules/highlightjs')
)

const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

app.use(
  cookieParser('7hIseGuy.H3_f$&*5'),
  bodyParser.urlencoded({ extended: false }),
  bodyParser.json()
)
app.set('json spaces', 2)
app.use('/api', require('./api'))

app.use((req, res) => {
  res.sendStatus(404)
})


function startExpress() {
  return app.listen(process.env.PORT, console.log(`Express listening on http://localhost:${process.env.PORT}/`))
  .on('error', err => {
    console.error(`Express error: ${err.code}, ${err.errno}, ${err.address}, ${err.port}`)
  })
}

let listener = startExpress()

function stopExpress(listener) {
  listener.close()
}

module.exports = {_startExpress: startExpress, _stopExpress:stopExpress, _listener:listener}