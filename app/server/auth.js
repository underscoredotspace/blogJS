'use strict'
const OTP = require('otp.js')
const GA = OTP.googleAuthenticator
const db = require('./mongo')
const crypto = require('crypto')
const bcrypt = require('bcrypt')
let lastCode = null
const otpRegEx = /^[0-9]{6}$/

module.exports = {
  checkCode, 
  qrCode, 
  getCode, 
  validateCode, 
  _newSecret: newSecret, 
  _getSecret: getSecret}

function newSecret (cb) {
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

function getSecret (cb) {
  db.collection('admin').find().toArray((err, data) => {
    if (err) {
      cb(err)
    } else {
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
            cb('problem with admin record')
          }
        }
      }
    }
  })
}

function getCode (cb) {
  getSecret((err, secret, verified) => {
    if (err) {
      cb(err)
    } else {
      cb(null, GA.gen(secret), verified)
    }
  })
}

function validateCode (req, res, next) {
  if(otpRegEx.test(req.body.code)) {
    next()
  } else {
    res.status(401).json({err: 'Invalid code'})
  }
}

function checkCode (code, cb) {
  if (code === lastCode) {
    cb('Wait for next code')
  } else {
    getSecret((err, secret, verified) => {
      if (err) {
        cb(err)
      } else {
        const delta = GA.verify(code, secret)
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

function qrCode (cb) {
  const user = 'user', org = 'blog'
  getSecret((err, secret) => {
    if (err) {
      cb(err)
    } else {
      cb(null, GA.qrCode(user, org, secret))
    }
  })
}