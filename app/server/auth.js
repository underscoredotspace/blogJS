const OTP = require('otp.js')
const GA = OTP.googleAuthenticator
const user = require('./models/user-model')
const otpMatcher = /^\d{6}$/
let lastCode

function printSetupCode() {
  return getUser()
    .then(user => {
      if (user.verified) {
        throw('User verified')
      } else {
        console.info(GA.gen(user.secret))
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
        return resolve({verified:user.verified})
      } else {
        return reject('Incorrect code')
      }
    })
  })
}

function genQR() {
  const user = 'user', org = 'blog'
  
  return getUser()
    .then(user => {
      if (user.verified) {
        throw('User verified')
      } else {
        return GA.qrCode(user, org, user.secret)
      }
    })
}

function getUser() {
  return user.findOne().then(res => {
    return {
      secret: res.secret,
      verified: res.verified
    }
  })
}

function checkCookie (req, res, next) {
  if(req.signedCookies['qqBlog']) {
    next()
  } else {
    res.sendStatus(401)
  }
}

module.exports = {checkCode, _getUser: getUser, checkCookie, printSetupCode, genQR}