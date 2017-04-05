var OTP = require('otp.js')
var GA = OTP.googleAuthenticator
var db = require('./mongo')
var bcrypt = require('bcrypt')

var newSecret = (cb) => {
  bcrypt.hash(process.env.GA_PASS, 5, (err, hash) => {
    cb(err, hash)
  })
}

var getSecret = (cb) => {
  db.collection('admin').find().toArray((err, data) => {
    if (data.length > 1) {
      cb('too many records in admin collection')
    } else {
      if (data.length==0) {
        //set up the key
        newSecret((err, secret) => {
          if (err) {
            cb(err)
          } else {
            db.collection('admin').insert({secret: secret, verified: false}) 
            cb(null, GA.encode(secret), false)
          }
        })
      } else {
        if (data[0].hasOwnProperty('secret') && data[0].hasOwnProperty('verified') && data[0].secret) {
          cb(null, GA.encode(data[0].secret), data[0].verified)  
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

var checkCode = (code, cb) => {
  getSecret((err, secret, verified) => {
    if (err) {
      cb(err)
    } else {
      var delta = GA.verify(code, secret)
      if (delta && Math.abs(delta.delta) <= 1) {
        cb(null, true, verified)
      } else {
        cb(null, false)
      }
    }
  })
}

var qrCode = (cb) => {
  var user = process.env.USER || 'ampersand', org = process.env.ORG || 'colon.underscore.space'
  getSecret((err, secret) => {
    if (err) {
      cb(err, null)
    } else {
      cb(null, GA.qrCode(user, org, secret))
    }
  })
}

module.exports = {checkCode, qrCode, getCode}