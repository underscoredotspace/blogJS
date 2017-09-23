const route = require('express').Router()
const auth = require('../auth')

route.get('/code', (req, res) => {
  auth.printSetupCode()
    .then(res.sendStatus(200))
    .catch(res.sendStatus(500))
})
                  
route.post('/qr', (req, res) => {
  res.json({qr:'qrcode'})
})

route.post('/verify', (req, res) => {
  res.sendStatus(200)
})

module.exports = route