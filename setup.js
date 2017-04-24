'use strict'

var routes = require('express').Router()
var db = require('./mongo')
var auth = require("./auth.js")

// If blog setup not yet complete, prints admin code to server console
routes.get('/adminCode', (req, res) => {
  auth.getCode((err, code, verified) => {
    if (err) {
      console.error('Error getting admin code:', err)
      res.status(500).json({err: err})
    } else if (verified) {
      console.error('Already verifed. Code no longer available.')
      res.status(403).json({err: 'Already verifed. Code no longer available.'})
    } else {
      console.log('Your admin code is:', code)
      res.sendStatus(200)
    }
  })
})

// Generates and sends QR code
routes.post('/qr', auth.validateCode, (req, res) => {
    auth.checkCode(req.body.code, (err, valid, verified) => {
      if (err || valid != true || verified) {
        res.status(401).json({err: err, valid: valid, verified: verified}) 
      } else {
        auth.qrCode((err, qr) => {
          if (err) {
            res.status(500).json({err: err})
          } else {
            res.json({qr: qr})
          }
        })
      }
    })
})

// Verifies GA code after QR code scanned
routes.post('/verify', auth.validateCode, (req, res) => {
  auth.checkCode(req.body.code, (err, valid) => {
    if (valid) {
      db.collection('admin').update({}, {$set: {verified: true}})
    }
    if (err || !valid) {
      res.status(401)
    }
    res.cookie('qqBlog', true, { maxAge: 1000 * 60 * 60, signed: true })
    res.json({err: err, valid: valid})
  })
})

module.exports = routes