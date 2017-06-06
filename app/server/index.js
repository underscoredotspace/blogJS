'use strict'
var express = require('express')
var app = express()

if (!process.env.MONGO_ADDR) {
  require('dotenv').config()
  if (!process.env.MONGO_ADDR) {
    throw(new Error('Environment variable "MONGO_ADDR" must point to your mongodb'))
  }
}

require('./mongo').connect(process.env.MONGO_ADDR, (err) => {
  if (err) {
    throw(err)
  } else {
    console.info('Connected to mongo')
    
    const onHeaders = require('on-headers')

    app.use((req, res, next) => {
      onHeaders(res, function() {
        this.removeHeader('Cache-Control')
      })
      next()
    })
   
    var cookieParser = require('cookie-parser')
    app.use(cookieParser('7hIseGuy.H3_f$&*5'))
    
    var bodyParser = require('body-parser')
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())

    app.use(express.static('app/client'))
    
    app.set('json spaces', 2)
    app.use('/api', require('./api'))

    app.use((req, res) => {
      res.sendStatus(404)
    })
  
    // listen for requests :)
    var listener = app.listen(process.env.PORT, function () {
      console.info(`Your app is listening on http://localhost:${listener.address().port}`)
    }).on('error', (err) => {
      throw(err)
    })
  }
})