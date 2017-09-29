const route = require('express').Router()
const uuid = require('uuid/v4')
const auth = require('../auth')

route.post('/login', (req, res) => {
  auth.checkCode(req.body.code).then(user => {
    if (!user.verified) {
      return res.status(403).json({err:'Not verified'})
    }
    res.cookie('qqBlog', uuid(), {maxAge: 1000 * 60 * 60, signed: true})
    res.sendStatus(200)
  }).catch(err => errHandle(err, res))
})

route.get('/logout', (req, res) => {
  res.clearCookie('qqBlog')
  res.sendStatus(200)
})

function errHandle(err, res) {
  console.error(err)
  if (err.hasOwnProperty('403')) {
    return res.sendStatus(403)
  }
  return res.sendStatus(500)
}

module.exports = route