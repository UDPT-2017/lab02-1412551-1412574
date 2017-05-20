// app/routes.js
module.exports = function(app, passport) {

	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
		res.render('home.hbs'); 
	});
	app.get('/home', function(req, res) {
		res.render('home.hbs'); 
	});

	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', notLoggedIn, function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('login.hbs', { message: req.flash('loginMessage') });
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/mailbox', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
		}),
        function(req, res) {
            console.log("hello");

            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('signup.hbs', { message: req.flash('signupMessage') });
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/home', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	
	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});


	//===========================
	// Mailbox===================
	//===========================
	app.get('/mailbox', isLoggedIn, function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('mailbox.hbs');
	});


	//===========================
	// Users===================
	//===========================
	/* begin test     */

	var mysql = require('mysql');
	var bcrypt = require('bcrypt-nodejs');
	var dbconfig = require('../config/database');
	var connection = mysql.createConnection(dbconfig.connection);

	var connectionString = connection.query('USE ' + dbconfig.database);

	//conect user
	// var user = {
	// 	Getuser: function(callback){
	// 		    connection.query("SELECT username FROM users", function(err, result, fields){
	// 			if(err) throw err;
	//          	console.log(JSON.stringify(result));
	// 	     	callback(err, result.rows, fields);}
	//         });
	// 	}
	// };
	//////get friends

	//get user
	app.get('/users', isLoggedIn, function (req, res) {

		 connection.query("select * from users u1 where u1.id not in (SELECT u.id FROM users u, friend f WHERE (f.idUser = " + req.user.id+" and f.idFriend  = u.id) or (f.idFriend = " + req.user.id+" and f.idUser  = u.id)) and u1.id != " + req.user.id+"", function(err, rows) {
             if(err)
                res.end();
             connection.query("SELECT * FROM users u, friend f WHERE (f.idUser = " + req.user.id+" and f.idFriend  = u.id) or (f.idFriend = " + req.user.id+" and f.idUser  = u.id)", function(err, row) {
            	if(err)
                 	res.end();
	             res.render('users.hbs',{users:rows,
	             	friend:row
	             });
	          })
         })

	});
	//post user--Add user on listfriend
	app.post('/addfriend', isLoggedIn, function (req, res){
    	connection.query("INSERT INTO friend (idUser, idFriend) values ("+req.user.id+","+req.body.id+")", function(err, result) {
    		if(err)
    			res.end();
			// res.send("Add friend is success!");
			res.redirect('/users');
        		
		})

		/*connection.query("INSERT INTO friends (username, name, phone ) values ("+req.body.user.username+","+req.body.user.name+","+req.body.user.phone+")", function(err, rows) {
			if(err)
                res.end();
         	connection.query("SELECT * FROM  friends f WHERE f.username = "+req.body.user.username+"", function(err, row) {
         		if(err)
                res.end();
            	connection.query("INSERT INTO chitietusers (idUser, idFriend) values ("+req.user.id+","+row[0].ID+")", function(message) {
            		res.send("Add friend is success!");
            	})
         	})

			})
	 */
	});

	app.post('/removefriend', isLoggedIn, function (req, res){
    	connection.query("DELETE FROM friend WHERE (idUser = "+req.user.id+" and idFriend = "+req.body.id+") or (idUser = "+req.body.id+" and idFriend = "+req.user.id+")", function(err, result) {
    		if(err)
    			res.end();
			// res.send("Add friend is success!");
			res.redirect('/users');
        		
		})
	});
 /* end test*/
	/*app.get('/users', isLoggedIn, function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('users.hbs');

	});*/

	//===========================
	// About===================
	//===========================
	app.get('/about', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('about.hbs');
	});

	
	//
	app.get('/listfriend', isLoggedIn, function(req, res) {
		connection.query("SELECT * FROM users u, friend f WHERE (f.idUser = " + req.user.id+" and f.idFriend  = u.id) or (f.idFriend = " + req.user.id+" and f.idUser  = u.id)", function(err, rows) {
            if(err)
                res.end();
		// render the page and pass in any flash data if it exists
			res.render('listfriend.hbs',{friends:rows
			});
		})
	});
};

// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}

function notLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (!req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}

