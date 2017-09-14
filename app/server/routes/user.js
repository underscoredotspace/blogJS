const route = require('express').Router()
const uuid = require('uuid/v4')
const auth = require('../auth')

route.post('/login', (req, res) => {
  auth.checkCode(req.body.code).then(() => {
    res.cookie('qqBlog', uuid(), {maxAge: 1000 * 60 * 60, signed: true})
    res.sendStatus(200)
  }).catch(err => {
    if (typeof err !== 'string') {
      console.error(err)
      res.sendStatus(500)
    } else {
      res.status(403).json({err})
    }
  })
})

route.get('/logout', (req, res) => {
  res.clearCookie('qqBlog')
  res.sendStatus(200)
})

module.exports = route