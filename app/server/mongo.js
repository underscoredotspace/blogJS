'use strict'
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

const state = {db: null}

function disconnect() {
  state.db = null
}

function connect (url, done) {
  if (state.db) {
    done()
  } else {
    MongoClient.connect(url, (err, db) => {
      if (err) {
        done(err)
      } else {
        state.db = db
        done()
      }
    })
  }
}

function collection(collectionName) {
  if (!collectionName) {
    return null
  } else {
    return state.db.collection(collectionName)
  }
}

module.exports = {connect, _disconnect:disconnect, collection, ObjectId: mongodb.ObjectId}