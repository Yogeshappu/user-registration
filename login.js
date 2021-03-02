var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'root',
	database: 'nodelogin'
	// socketPath: '/var/run/mysqld/mysqld.sock'
});

var app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', function (request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});

app.get('/registerform', function (request, response) {
	response.sendFile(path.join(__dirname + '/register.html'));
});

app.get('/loginform', function (request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});

app.post('/auth', function (request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function (error, results, fields) {
			if (error) {
				console.log('Error :', error);
			}
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/home', function (request, response) {
	if (request.session.loggedin) {
		response.send('Welcome back, ' + request.session.username + '!');
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});

app.post('/register', function (request, response) {
	var username = request.body.username;
	var password = request.body.password;
	var email = request.body.email;
	var mobilenumber = request.body.mobilenumber;

	if (username && password && email && mobilenumber) {
		var query = 'INSERT INTO accounts (username, password, email, phonenumber) VALUES ?';
		var VALUES = [
			[username, password, email, mobilenumber]
		];
		connection.query(query, [VALUES], function (error, results) {
			if (error) {
				console.log('Error :', error);
			}
			if (results.affectedRows >= 1) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/list', function (request, response) {
	connection.query('SELECT * FROM accounts', function (error, results, fields) {
		if (error) {
			console.log('Error :', error);
		}
		if (results.length > 0) {
			response.json(results);
			response.send();
		} else {
			response.send('No data found!!');
		}
		response.end();
	});

});

app.listen(3000);