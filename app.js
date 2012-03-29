var config = require('./config');
var express = require('express');

var app = express.createServer();
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session(config.session));

var db = require('./db');
var router = require('./router')(app);
var users = require('./users')(db);
var auth = require('./auth')(app, db, router);

router.register('index', '/');
router.get(router.url('index'), function (req, res) {
  if (req.user)
    res.end('name: ' + req.user.name);
  else
    res.end('log in at ' + router.url('login'));
});

app.listen(config.port);
