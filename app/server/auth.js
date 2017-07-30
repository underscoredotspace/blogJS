const OTP = require('otp.js')
const GA = OTP.googleAuthenticator
const user = require('./models/user-model')
const otpMatcher = /^\d{6$}/

function checkCode(code = '') {
  return new Promise((resolve, reject) => {
    if (!otpMatcher.test(code)) {
      return reject('Invalid code')
    }

    getSecret(secret => {
      if (Math.abs(GA.verify(code, secret).delta) <=1) {
        return resolve()
      } else {
        return reject('Incorrect code')
      }
    })
  })
}

function getSecret() {
  return user.findOne().then(res => {
    console.log(res)
    return res.secret
  })
}

module.exports = {checkCode, _getSecret: getSecret}