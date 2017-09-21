const OTP = require('otp.js')
const GA = OTP.googleAuthenticator
const user = require('./models/user-model')
const otpMatcher = /^\d{6}$/
let lastCode

function checkCode(code = '') {
  return new Promise((resolve, reject) => {
    if (!otpMatcher.test(code) || (code === lastCode)) {
      return reject('Invalid code')
    }

    lastCode = code

    getSecret().then(secret => {
      const verified = GA.verify(code, secret)
      if (verified && Math.abs(verified.delta) <=1) {
        return resolve(true)
      } else {
        return reject('Incorrect code')
      }
    })
  })
}

function getSecret() {
  return user.findOne().then(res => res.secret)
}

function checkCookie (req, res, next) {
  if(req.signedCookies['qqBlog']) {
    next()
  } else {
    res.sendStatus(401)
  }
}

module.exports = {checkCode, _getSecret: getSecret, checkCookie}