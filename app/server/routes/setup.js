const route = require('express').Router()
const auth = require('../auth')

route.get('/code', (req, res) => {
  auth.printSetupCode()
    .then(() => res.sendStatus(200))
    .catch(err => errHandle(err, res))
})
                  
route.post('/qr', (req, res) => {
  auth.checkCode(req.body.code)
    .then(() => auth.genQR())
    .then(qr => res.send({qr}))
    .catch(err => errHandle(err, res))
})

route.post('/verify', (req, res) => {
  auth.checkCode(req.body.code)
    .then(() => auth.verifyUser())
    .then(verified => res.send(verified))
    .catch(err => errHandle(err, res))
})

function errHandle(err, res) {
  console.error(err)
  if (err.hasOwnProperty('403')) {
    return res.sendStatus(403)
  }
  return res.sendStatus(500)
}

module.exports = route