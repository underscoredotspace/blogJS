'use strict'
var OTP = require('otp.js')
var GA = OTP.googleAuthenticator
var db = require('./mongo')
var crypto = require('crypto')
var bcrypt = require('bcrypt')
var lastCode = null
const otpRegEx = /^[0-9]{6}$/

var newSecret = (cb) => {
  crypto.randomBytes(256, (err, buf) => {
    if (err) {
      cb(err)
    } else {
      bcrypt.hash(buf.toString(), 5, (err, hash) => {
        cb(err, GA.encode(hash))
      })
    }
  })
}

var getSecret = (cb) => {
  db.collection('admin').find().toArray((err, data) => {
    if (data.length > 1) {
      cb('too many records in admin collection')
    } else {
      if (data.length === 0) {
        newSecret((err, secret) => {
          if (err) {
            cb(err)
          } else {
            db.collection('admin').insert({secret: secret, verified: false}) 
            cb(null, secret, false)
          }
        })
      } else {
        if (data[0].hasOwnProperty('secret') && data[0].hasOwnProperty('verified') && data[0].secret) {
          cb(null, data[0].secret, data[0].verified)  
        } else {
          cb('problem with admin record', null)
        }
      }
    }
  })
}

var getCode = (cb) =>{
  getSecret((err, secret, verified) => {
    if (err) {
      cb(err)
    } else {
      cb(null, GA.gen(secret), verified)
    }
  })
}

var validateCode = (req, res, next) => {
  if(otpRegEx.test(req.body.code)) {
    next()
  } else {
    res.status(401).json({err: 'Invalid code'})
  }
}

var checkCode = (code, cb) => {
  if (code === lastCode) {
    cb('Wait for next code')
  } else {
    getSecret((err, secret, verified) => {
      if (err) {
        cb(err)
      } else {
        var delta = GA.verify(code, secret)
        if (delta && Math.abs(delta.delta) <= 1) {
          lastCode = code
          cb(null, true, verified)
        } else {
          cb(null, false)
        }
      }
    })
  }
}

var qrCode = (cb) => {
  var user = 'user', org = 'blog'
  getSecret((err, secret) => {
    if (err) {
      cb(err)
    } else {
      cb(null, GA.qrCode(user, org, secret))
    }
  })
}

module.exports = {checkCode, qrCode, getCode, validateCode}