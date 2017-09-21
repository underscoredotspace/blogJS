const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
  title: String,
  content: String,
  date: {
    type: Date, 
    default: Date.now
  }
}, {collection: 'blog'})

const blog = mongoose.model('blog', blogSchema)

module.exports = blog