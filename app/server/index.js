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

const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

app.use(
  cookieParser(process.env.COOKIE_SECRET),
  bodyParser.urlencoded({ extended: false }),
  bodyParser.json()
)
app.set('json spaces', 2)
app.use('/api', require('./routes/api'))

app.use((req, res) => {
  res.sendStatus(404)
})

const startExpress = (expressApp, port = process.env.PORT) =>  new Promise((resolve, reject) => {
  if (!expressApp || !expressApp.hasOwnProperty('listen')) {
    reject({err: 'Express app required'})
  } else {
    const listen = expressApp.listen(port)  
    if (listen && listen.listening) {
      resolve(listen)
    } else {
      let timeout = setTimeout(() => {
        reject({err: 'timeout'})
      }, 1000)
      listen.on('error', err => {
        clearTimeout(timeout)
        reject(err)
      })
    }
  }
})

let listener

startExpress(app).then(listen => {
  listener = listen
  listen.on('error', console.error)
  console.log('Express is listening')
}).catch(console.error)

function stopExpress() {
  listener.close()
}

module.exports = {_startExpress: startExpress, _stopExpress:stopExpress, _listener:listener}