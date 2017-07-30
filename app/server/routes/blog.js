const route = require('express').Router()
const blog = require('../models/blog-model')

const BLOG_LIMIT = 3

route.get(['/:page', '/'], (req, res) => {
  const page = Number(req.params.page)
  const skip = (page * BLOG_LIMIT) - BLOG_LIMIT

  blog.find().sort({date:-1}).skip(skip).limit(BLOG_LIMIT)
    .then(posts => {
      res.json(posts)
    })
    .catch(err => {
      console.error({err: err.name, message: err.message})
      res.status(400).json({err: err.name, message: err.message})
    })
})

route.get('/id/:id', (req, res) => {
  blog.findById(req.params.id)
    .then(post => {
      res.json([post])
    })
    .catch(err => {
      console.error({err: err.name, message: err.message})
      res.status(400).json({err: err.name, message: err.message})
    })
})

module.exports = route