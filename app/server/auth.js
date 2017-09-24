const OTP = require('otp.js')
const GA = OTP.googleAuthenticator
const User = require('./models/user-model')
const otpMatcher = /^\d{6}$/
let lastCode

function newSecret() {
  const crypto = require('crypto')
  const bcrypt = require('bcrypt')

  return new Promise((resolve, reject) => {
    crypto.randomBytes(256, (err, buf) => {
      if (err) {
        return reject(err)
      }
      
      bcrypt.hash(buf.toString(), 5, (err, hash) => {
        if (err) {
          return reject(err)
        }

        return User.create({
          secret: GA.encode(hash), verified: false
        }).then(user => {
          return {
            secret: user.secret,
            verified: user.verified
          }
        })
        .catch(err => console.error({err: err.name, message: err.message}))
      })
    })
  })
}

function printSetupCode() {
  return getUser()
    .then(user => {
      if (user.verified) {
        throw('User verified')
      } else {
        const code = GA.gen(user.secret)
        console.info(code)
        lastCode = code
      }
    })
}

function checkCode(code = '') {
  return new Promise((resolve, reject) => {
    if (!otpMatcher.test(code) || (code === lastCode)) {
      return reject('Invalid code')
    }

    lastCode = code

    getUser().then(user => {
      const verified = GA.verify(code, user.secret)
      if (verified && Math.abs(verified.delta) <=1) {
        if (!user.verified) {
          verifyUser().then(() => user.verifed = true)
        }
        return resolve({verified:user.verified})
      } else {
        return reject('Incorrect code')
      }
    })
  })
}

function genQR() {
  const userName = 'user', org = 'blog'
  
  return getUser()
    .then(user => {
      if (user.verified) {
        throw('User verified')
      } else {
        return GA.qrCode(userName, org, user.secret)
      }
    })
}

function getUser() {
  return User.findOne().then(user => {
    if (user) {
      return {
        secret: user.secret,
        verified: user.verified
      }
    } else {
      return newSecret()
        .then(secret => {
          return {secret, verified: false}
        })
    }
  })
}

function verifyUser() {
  return User.findOneAndUpdate({}, {verified:true})
}

function checkCookie (req, res, next) {
  if(req.signedCookies['qqBlog']) {
    next()
  } else {
    res.sendStatus(401)
  }
}

module.exports = {checkCode, _getUser: getUser, _newSecret: newSecret, checkCookie, printSetupCode, genQR}