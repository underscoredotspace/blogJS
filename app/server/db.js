const mongoose = require('mongoose')

mongoose.Promise = global.Promise

function connect() {
  mongoose.connect(process.env.MONGO_ADDR, {useMongoClient: true})
    .then(db => console.log(`mongoose connected to ${db.db.databaseName}`))
    .catch(err => console.error(`mongoose error: ${err}`))
}

module.exports = {connect}