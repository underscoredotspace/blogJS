'use strict'
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

var state = {
  db: null,
}

const connect = (url, done) => {
  if (state.db) {
    return done()
  }

  MongoClient.connect(url, (err, db) => {
    if (err) {
      return done(err)
    }
    state.db = db
    done()
  })
}

const collection = (collectionName) => {
  if (!collectionName) {
    return null
  } else {
    return state.db.collection(collectionName)
  }
}

module.exports = {connect, collection, ObjectId: mongodb.ObjectId}