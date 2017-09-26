const route = require('express').Router()
const auth = require('../auth')

route.get('/code', (req, res) => {
  auth.printSetupCode()
    .then(() => res.sendStatus(200))
    .catch(err => {
      if (err === 'User verified') {
        res.sendStatus(403)
      } else {
        res.sendStatus(500)
      }
    })
})
                  
route.post('/qr', (req, res) => {
  auth.genQR(req.body.code)
    .then(qr => res.send({qr}))
    .catch(err => {
      if (err === 'User verified') {
        res.sendStatus(403)
      } else {
        res.sendStatus(500)
      }
    })
})

route.post('/verify', (req, res) => {
  auth.checkCode(req.body.code)
    .then(() => auth.verifyUser())
    .then(verified => res.send(verified))
    .catch(() => res.sendStatus(403))
})

module.exports = route