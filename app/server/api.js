'use strict'
const routes = require('express').Router()
const db = require('./mongo')
const auth = require('./auth.js')
const oIDRegEx = /^[a-f\d]{24}$/i

routes.get('/latest/:count', (req, res) => {
  const countRegEx = /^[0-9]{0,2}$/   // Number from 0-20
  if (!countRegEx.test(req.params.count) || Number(req.params.count)>20) {
    res.status(400).json({err: 'count must be 1-20'})
  } else {
    db.collection('blog').find({}).sort({'_id':-1}).limit(Number(req.params.count)).toArray((err, data) => {
      if (err) {
        res.status(500).json(err)
      }
      if (data.length === 0) {
        res.sendStatus(204)
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
  if (!oIDRegEx.test(req.params.id)) {
    res.status(400).json({err:'Bad post ID'})
  } else {
    db.collection('blog').find({'_id': db.ObjectId(req.params.id)}).toArray((err, data) => {
      if (err) {
        res.status(500).json({err:err})
      }
      if (data.length === 0) {
        res.sendStatus(204)
      } else {
        res.json(data)
      }
    })
  }
})

routes.post('/login', auth.validateCode, (req, res) => {
  auth.checkCode(req.body.code, (err, valid, verified) => {
    if (err || valid !== true || !verified) {
      res.status(401).json({err: err, valid: valid, verified: verified}) 
    } else {
      res.cookie('qqBlog', true, { maxAge: 1000 * 60 * 60, signed: true })
      res.json({loggedin: true})
    }
  })
})

routes.get('/logout', (req, res) => {
  res.clearCookie('qqBlog')
  res.json({loggedin: false})
})

routes.post('/post', auth.checkCookie, (req, res) => {
  if (req.body.blogpost.title.length < 5 || req.body.blogpost.content.length <5) {
    res.status(400).json({err: 'Post or title not long enough'})
  } else {
    const newPost = {
      _id: db.ObjectId(),
      title: req.body.blogpost.title,
      content: req.body.blogpost.content,
      date: new Date()
    }
    db.collection('blog').insertOne(newPost, (err, data) => {
      if (err) {
        res.status(500).json({err: err})
      } else {
        res.json({'id': newPost._id})
      }
    })
  }
})

routes.delete('/post/:id', auth.checkCookie, (req, res) => {
  if (!oIDRegEx.test(req.params.id)) {
    res.status(400).json('Bad post ID')
  } else {
    db.collection('blog').remove({'_id': db.ObjectId(req.params.id)}, (err, data) => {
      res.json({'err': err, 'res': data})
    })
  }
})

routes.patch('/post/:id', auth.checkCookie, (req, res) => {
  if (!oIDRegEx.test(req.params.id)) {
    res.status(400).json('Bad post ID')
  } else {
    if (req.body.blogpost.title.length < 5 || req.body.blogpost.content.length <5) {
      res.status(400).json({err: 'Post or title not long enough'})
    } else {
      const thePost = {
        title: req.body.blogpost.title,
        content: req.body.blogpost.content
      }
      db.collection('blog').updateOne({'_id': db.ObjectId(req.params.id)}, {$set:thePost}, (err, data) => {
        if (err) {
          res.status(500).json({err: err})
        } else {
          res.json({'id': req.params.id})
        }
      })
    }
  }
})

routes.use('/setup', require('./setup'))

routes.use((req, res) => {
  res.sendStatus(404)
})

module.exports = routes