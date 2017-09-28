const GA = require('otplib/authenticator'),
  crypto = require('crypto'),
  qrcode = require('qrcode'),
  User = require('./models/user-model'),
  otpMatcher = /^\d{6}$/
  GA.options = {crypto}

let lastCode

function newSecret() {
  const secret = GA.generateSecret()

  return User.create({
    secret, verified: false
  }).then(user => ({
      secret: user.secret,
      verified: user.verified
    })
  )
  .catch(err => console.error({err: err.name, message: err.message}))
}

function printSetupCode() {
  return getUser()
    .then(user => {
      if (user.verified) {
        throw({'403':'User verified'})
      } else {
        const code = GA.generate(user.secret)
        console.info(code)
        lastCode = code
      }
    })
}

function checkCode(code = '') {
  return new Promise((resolve, reject) => {
    if (!otpMatcher.test(code) || (code === lastCode)) {
      return reject({'403':'Invalid code'})
    }

    lastCode = code

    getUser().then(user => {
      const codeOk = GA.check(code, user.secret, {step:90})
      if (codeOk) {
        return resolve({verified:user.verified})
      } else {
        return reject({'403':'Incorrect code'})
      }
    })
  })
}

function genQR() {
  return getUser().then(user => {
    if (user.verified) {
      throw({'403':'User verified'})
    }

    const userName = 'user', org = 'blog'
    const util = require('util')
    const key = GA.keyuri(userName, org, user.secret)
    const toStringAsync = util.promisify(qrcode.toString)
    return toStringAsync(key, {type:'svg'})
  })
}

function getUser() {
  return User.findOne().then(user => {
    if (user) {
      return {
        secret: user.secret,
        verified: user.verified
      }
    }
    return newSecret()
      .then(secret => ({secret, verified: false}))
  })
}

function verifyUser() {
  return User.findOneAndUpdate({}, {verified:true})
    .then(user => user.verified)
}

function checkCookie (req, res, next) {
  if(req.signedCookies['qqBlog']) {
    next()
  } else {
    res.sendStatus(401)
  }
}

module.exports = {checkCode, _getUser: getUser, _newSecret: newSecret, checkCookie, printSetupCode, genQR, verifyUser}