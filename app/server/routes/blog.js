const route = require('express').Router()
const Blog = require('../models/blog-model')
const mongoose = require('mongoose')
const auth = require('../auth')

const BLOG_LIMIT = 3

route.get(['/:page', '/'], (req, res) => {
  const page = Number(req.params.page)
  const skip = (page * BLOG_LIMIT) - BLOG_LIMIT

  Blog.find().sort({date:-1}).skip(skip).limit(BLOG_LIMIT)
    .then(posts => {
      res.json(posts)
    })
    .catch(err => errHandle(err, res))
})

route.get('/id/:id', (req, res) => {
  Blog.findById(req.params.id)
    .then(post => {
      res.json([post])
    })
    .catch(err => errHandle(err, res))
})

route.post('/', auth.checkCookie, (req, res) => {
  if (req.body.blogpost.title.length < 5 || req.body.blogpost.content.length <5) {
    res.status(400).json({err: 'Post or title not long enough'})
    return 
  }

  const blogPost = req.body.blogPost
  Blog.create(blogPost)
    .then(newPost => {
      res.json({id:newPost.id})
    })
    .catch(err => errHandle(err, res))
})

function errHandle(err, res, httpErr = 500) {
  console.error({err: err.name, message: err.message})
  res.status(httpErr).json({err: err.name, message: err.message})
}

module.exports = route