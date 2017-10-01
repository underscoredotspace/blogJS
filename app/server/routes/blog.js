const route = require('express').Router()
const Blog = require('../models/blog-model')
const auth = require('../auth')

const BLOG_LIMIT = 3

route.get(['/:page', '/'], (req, res) => {
  const page = Number(req.params.page)
  const skip = (page * BLOG_LIMIT) - BLOG_LIMIT

  Blog.find().sort({date:-1}).skip(skip).limit(BLOG_LIMIT + 1)
    .then(posts => {
      let more = false
      if (posts.length === BLOG_LIMIT + 1) {
        more = true
        posts = posts.slice(0, BLOG_LIMIT)
      }
      res.json({posts, more})
    })
    .catch(err => errHandle(err, res))
})

route.get('/id/:id', (req, res) => {
  Blog.findById(req.params.id)
    .then(post => {
      res.json({posts:[post]})
    })
    .catch(err => errHandle(err, res))
})

route.post('/', auth.checkCookie, (req, res) => {
  if (req.body.blogpost.title.length < 5 || req.body.blogpost.content.length <5) {
    res.status(400).json({err: 'Post or title not long enough'})
    return 
  }

  const blogpost = req.body.blogpost
  Blog.create(blogpost)
    .then(blogpost => {
      res.json({id:blogpost.id})
    })
    .catch(err => errHandle(err, res))
})

route.delete('/:id', auth.checkCookie, (req, res) => {
  Blog.findByIdAndRemove(req.params.id)
    .then(blogpost => {
      res.sendStatus(200)
    })
    .catch(err => errHandle(err, res))
})

route.patch('/:id', auth.checkCookie, (req, res) => {
  if (req.body.blogpost.title.length < 5 || req.body.blogpost.content.length <5) {
    res.status(400).json({err: 'Post or title not long enough'})
    return 
  }
  
  Blog.findByIdAndUpdate(req.params.id, req.body.blogpost)
    .then(blogpost => {
      res.sendStatus(200)
    })
    .catch(err => errHandle(err, res))
})

function errHandle(err, res, httpErr = 500) {
  console.error({err: err.name, message: err.message})
  res.status(httpErr).json({err: err.name, message: err.message})
}

module.exports = route