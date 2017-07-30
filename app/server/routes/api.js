'use strict'
const express = require('express')
const api = express.Router()

api.use('/blog', require('./blog'))
api.use('/user', require('./user'))
// api.use('/setup', require('./setup')) // first run stuff

api.use((req, res) => {
  console.error(`${req.method} request for ${req.baseUrl}${req.url} - 404`)
  res.sendStatus(404)
})

module.exports = api