const GA = require('otplib/authenticator'),
  crypto = require('crypto'),
  qrcode = require('qrcode'),
  User = require('./models/user-model'),
  otpMatcher = /^\d{6}$/
  GA.options = {crypto}

let lastCode

function newSecret() {
  const secret = GA.generateSecret()
  return new Promise((resolve, reject) => {
    return User.create({
      secret, verified: false
    }).then(user => {
      return {
        secret: user.secret,
        verified: user.verified
      }
    })
    .catch(err => console.error({err: err.name, message: err.message}))
  })
}

function printSetupCode() {
  return getUser()
    .then(user => {
      if (user.verified) {
        throw('User verified')
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
      return reject('Invalid code')
    }

    lastCode = code

    getUser().then(user => {
      const codeOk = GA.check(code, user.secret, {step:90})
      if (codeOk) {
        return resolve({verified:user.verified})
      } else {
        return reject('Incorrect code')
      }
    })
  })
}

function genQR() {
  const userName = 'user', org = 'blog'
  return new Promise((resolve, reject) => {
    getUser().then(user => {
      if (user.verified) {
        return reject('User verified')
      } else {
        const key = GA.keyuri(userName, org, user.secret)
        qrcode.toString(key, {type:'svg'}, (err, qr) => {
          if (err) {
            return reject(err)
          }
          return resolve(qr)
        })
      }
    })
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