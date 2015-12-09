// name:    routes/login.js
// process: Handle the '/login' route
// authors: Scott Penrose

// XXX use exception handlers instead of multiple 'if (err) throw err' statements
// I had this working but had to remove it when I moved to using express-myconnection
// Should be simple enough to restore

var express   = require('express')
var app       = express();
var router    = express.Router();
var uuid      = require('uuid');
var jwt       = require('jsonwebtoken');

router.get('/login', function (req, res) {

	_render_login_page(res);

});

router.post('/login', function (req, res) {

	req.getConnection(function(err, dbh) {
		// XXX Cannot get this to work
		// dbh.on('error', function(err) {
		// 	console.log('ERROR***');
		// 	console.log(err);
		// 	});

		if (err) throw err;

		dbh.query(
			'SELECT id, name, password, shared_secret FROM login WHERE name = ? AND password = ?', 
			[req.body.username, req.body.password],
			function(err, results) {
				if (err) throw err;

				if (results.length > 0) {

					// Create a token
					var id        = uuid.v1();
					var user_name = results[0].name;
					var dt        = new Date();
					var create_dt = dtf.dt_fmt(dt);

					// Set our expiry time to 1 hour 
					dt.setHours ( dt.getHours() + 1 );               // Note expiresInMinutes arg in jwt.sign below
					var expiry_dt = dtf.dt_fmt(dt);

					// sign with default (HMAC SHA256)
					var token = jwt.sign({
						application_id: user_name
					},
					results[0].shared_secret, {
						expiresInMinutes: 60,                        // Note expiry_dt above
						issuer: 'http://security.oneapidev.org/',
					});

					/*
					console.log(token);

					var decoded = jwt.verify(token, shared_secret, {expiresInMinutes: 60, issuer: 'http://security.oneapidev.org/'}, function(err, decoded) {
						if (err)
							console.log(err);
						else
							console.log(decoded);
					});
					console.log(decoded);
					*/

					var token_record = {
						id:           id,
						token:        token,
						login_id:     results[0].id,
						create_time:  create_dt,
						expiry_time:  expiry_dt,
						login_method: 'TODO'
					};


					var query = dbh.query('INSERT INTO token SET ?', token_record, function(err, result) {
						if (err) throw err;  // TODO Handle more gracefully
					});


					dbh.query(
						"SELECT name, href, provider_id, '" + token + "' AS token FROM endpoint WHERE app_id = ?", 
						[req.body.username],
						function(err, results) {

							if (err) throw err;

							var endpoints = [];

							if (results.length > 0) {
								console.log(results);
								endpoints = results;
							}

							// TODO: Redirect if a redirectURL param is seen
							res.json({ 
								id: id,
								user_name: user_name,
								token: token_record.token,
								endpoint: endpoints
							});
					});

				} else {
					_render_login_page(res, {error: "Invalid username or password, please try again"});
				}

			});

	});
});

function _render_login_page(res, data) {

	var error_msg;
	if (!data) {
		error_msg = '';
	} else {
		error_msg = data.error;
	}

	res.render('login', { 
		heading: 'Login',
		action: '/login',
		user_prompt: 'Username or email address',
		pass_prompt: 'Password',
		login_btn_text: 'Log in',
		register_text: 'Register',
		register_url: '/register',
		lost_password_text: 'Lost your password?',
		lost_password_url: '/recover',
		error: error_msg
	});
}

module.exports = router;
