var config = require('./config');
var connect = require('connect');

var app = connect(
  connect.bodyParser(),
  connect.cookieParser(),
  connect.session({secret: config.session.secret})
);

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

app.use(router);
app.listen(8080);
