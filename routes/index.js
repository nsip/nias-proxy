// name:    routes/index.js
// process: Handle the '/' route
// authors: Scott Penrose

var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
	// render views/index.jade
	res.render('index', { 
		title: 'authentication',
		notes: 'empty page',
	});
});

module.exports = router;
