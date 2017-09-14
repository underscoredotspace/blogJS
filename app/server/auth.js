const OTP = require('otp.js')
const GA = OTP.googleAuthenticator
const user = require('./models/user-model')
const otpMatcher = /^\d{6}$/

function checkCode(code = '') {
  return new Promise((resolve, reject) => {
    if (!otpMatcher.test(code)) {
      return reject('Invalid code')
    }

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

module.exports = {checkCode, _getSecret: getSecret}