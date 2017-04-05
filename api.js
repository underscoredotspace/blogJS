var routes = require('express').Router();
var db = require('./mongo')

routes.get('/latest/:count', (req, res) => {
  var countRegEx = /^[0-9]{0,2}$/
  if (!countRegEx.test(req.params.count) || Number(req.params.count)>20) {
    res.status(400).json({err: 'count must be 1-20'})
  } else {
    db.collection('blog').find({}).sort({'_id':-1}).limit(Number(req.params.count)).toArray((err, data) => {
      if (err) {
        res.status(500).json(err)
      }
      if (data.length==0) {
        res.status(204).json({err:'no matches'})
      } else {
        res.json(data)
      }
    })
  }
})

routes.get('/latest', (req, res) => {
  res.redirect('/api/latest/1')
})

routes.post('/new', (req, res) => {
  console.log(req.body.blogpost)
  res.json(req.body.blogpost)
  // db.collection('blog').insert({test:req.body.blogpost}, (err, data) => {
  //   if (err) {
  //     res.json({err: err})
  //   } else {
  //     res.json({data: data})
  //   }
  // })
})

module.exports = routes

/*
	// This is the blog serving API for mongodb
	router.Path("/blog/latest/{count:[0-9]{0,2}}").HandlerFunc(mongo.getBlogHandler).Methods("GET")
	router.Path("/blog/{id:[0-9a-z]{24}}/{count:[0-9]{0,2}}").HandlerFunc(mongo.getBlogHandler).Methods("GET")
	router.Path("/blog/new").HandlerFunc(mongo.newBlogHandler).Methods("POST")

	// Routes alled /admin just now, but handle initial registration, and subsequent verifications for new posts
	router.Path("/admin/v/{username}/{code:[0-9]{6,6}}").HandlerFunc(mongo.verify).Methods("GET")
	router.Path("/admin/r/{username}").HandlerFunc(mongo.register).Methods("GET")

	// Serving of static files
	router.PathPrefix("/").Handler(http.FileServer(http.Dir("./client/")))
*/