const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  secret: String,
  verified: Boolean
}, {collection: 'admin'})

const User = mongoose.model('user', userSchema)

module.exports = User