
var express = require('express');
var app = express();

require('./mongo').connect(process.env.MONGO_ADDR, (err) => {
  if (err) {
    console.error(err)
    process.exit(1)
  } else {
    console.log('Connected to mongo');
  }
})

// var favicon = require('serve-favicon')
// var path = require('path')
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.set('json spaces', 2)
app.use('/api', require('./api'));
app.use(express.static('public'));

app.use((req, res) => {
  res.sendStatus(404)
})

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
