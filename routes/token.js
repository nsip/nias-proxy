// name:    routes/token.js
// process: Handle the '/token' route
// authors: Scott Penrose

var express = require('express')
var app     = express();
var router  = express.Router();

router.get('/token/:token', function (req, res) {

    var token_id = req.params.token;
    // TODO: Check token param
    //var identifier = /^\w+$/;
    //if (!identifier.test(token)) {
        //throw 'Invalid token name';
    //}
    var response = '';

	// TODO: Retrieve data
	req.getConnection(function(err, dbh) {
		if (err) throw err;

		dbh.query(
			'SELECT id, token, login_id, create_time, expiry_time, login_method FROM token WHERE id = ?', 
			[token_id],
			function(err, results) {

				if (err) res.json(err);

				if (results.length > 0) {
					res.json(results[0]);
				} else {
					res.json({id: 'Not found'});
				}

			});

	});

})

module.exports = router;
