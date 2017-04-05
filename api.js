var routes = require('express').Router()
var db = require('./mongo')
var auth = require("./auth.js")
const otpRegEx = /^[0-9]{6}$/

routes.get('/latest/:count', (req, res) => {
  var countRegEx = /^[0-9]{0,2}$/
  if (!countRegEx.test(req.params.count) || Number(req.params.count)>20) {
    res.status(400).json({err: 'count must be 1-20'})
  } else {
    db.collection('blog').find({}).sort({'_id':-1}).limit(Number(req.params.count)).toArray((err, data) => {
      if (err) {
        res.status(500).json(err)
      }
      if (data.length==0) {
        res.status(204).json({err:'no matches'})
      } else {
        res.json(data)
      }
    })
  }
})

routes.get('/latest', (req, res) => {
  res.redirect('/api/latest/1')
})

routes.post('/new', (req, res) => {
  console.log(req.body)
  if(otpRegEx.test(req.body.blogpost.code)) {
    auth.checkCode(req.body.blogpost.code, (err, valid, verified) => {
      if (err || valid != true || !verified) {
        res.status(401).json({err: err, valid: valid, verified: verified}) 
      } else {
        res.json({posted: true})
      }
    })
  } else {
    res.status(401).json({err: 'invalid code'})
  }
})

routes.post('/qr', (req, res) => {
  if (otpRegEx.test(req.body.code)) {
    auth.checkCode(req.body.code, (err, valid, verified) => {
      if (err || valid != true || verified) {
        res.status(401).json({err: err, valid: valid, verified: verified}) 
      } else {
        auth.qrCode((err, qr) => {
          if (err) {
            res.status(500).json({err: err})
          } else {
            res.json({qr: qr})
          }
        })
      }
    })
  } else {
    res.status(401).json({err: 'invalid code'})
  }
})

routes.post('/verify', (req, res) => {
  if (otpRegEx.test(req.body.code)) {
    auth.checkCode(req.body.code, (err, valid) => {
      if (valid) {
        db.collection('admin').update({}, {$set: {verified: true}})
      }
      res.status(401).json({err: err, valid: valid})
    })
  } else {
    res.status(401).json({err: 'invalid code'})
  }
})

routes.use((req, res) => {
  res.sendStatus(404)
})

module.exports = routes