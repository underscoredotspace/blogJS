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

routes.get('/post/:id', (req, res) => {
  db.collection('blog').find({'_id': db.ObjectId(req.params.id)}).toArray((err, data) => {
    if (err) {
      res.status(500).json(err)
    }
    if (data.length==0) {
      res.status(204).json({err:'no matches'})
    } else {
      res.json(data)
    }
  })
})


routes.get('/adminCode', (req, res) => {
  auth.getCode((err, code) => {
      if (err) {
        console.error('Error getting admin code:', err)
      } else {
        console.log('Your admin code is:', code)
      }
    })
  res.sendStatus(200)
})

routes.use((req, res, next) => {
  if(otpRegEx.test(req.body.code)) {
    next()
  } else {
    res.status(401).json({err: 'Invalid code'})
  }
})

routes.post('/new', (req, res) => {
  auth.checkCode(req.body.code, (err, valid, verified) => {
    if (err || valid != true || !verified) {
      res.status(401).json({err: err, valid: valid, verified: verified}) 
    } else {
      var newPost = {
        title: req.body.blogpost.title,
        content: req.body.blogpost.content,
        date: new Date()
      }
      db.collection('blog').insert(newPost)
      res.json({posted: true})
    }
  })
})

routes.post('/qr', (req, res) => {
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
})

routes.post('/verify', (req, res) => {
  auth.checkCode(req.body.code, (err, valid) => {
    if (valid) {
      db.collection('admin').update({}, {$set: {verified: true}})
    }
    if (err || !valid) {
      res.status(401)
    }
    res.json({err: err, valid: valid})
  })
})

routes.use((req, res) => {
  res.sendStatus(404)
})

module.exports = routes