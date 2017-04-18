
var express = require('express')
var app = express()

if (!process.env.MONGO_ADDR) {
  console.error('Environment variable \'MONGO_ADDR\' must point to your mongodb')
  process.exit(1)
}

require('./mongo').connect(process.env.MONGO_ADDR, (err) => {
  if (err) {
    console.error(err)
    process.exit(1)
  } else {
    console.log('Connected to mongo')
   
    var cookieParser = require('cookie-parser')
    app.use(cookieParser('mySecret'))
    
    var bodyParser = require('body-parser')
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())

    app.use(express.static('public'))
    app.use('/node_modules', express.static('node_modules'));
    
    app.set('json spaces', 2)
    app.use('/api', require('./api'))

    app.use((req, res) => {
      res.sendStatus(404)
    })
  
    // listen for requests :)
    var listener = app.listen(process.env.PORT, function () {
      console.log('Your app is listening on port ' + listener.address().port)
    });
  }
})