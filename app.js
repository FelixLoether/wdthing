var config = require('./config');
var express = require('express');

var app = express.createServer();
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session(config.session));
app.use(function (req, res, next) {
  if (req.url.slice(0, 6) === '/auth/')
    return next();

  if (req.url === '/')
    return next();

  // Strip trailing slash and make the url lowercase. And remove the query
  // part, we're not going to be using it.
  var url = req.url.toLowerCase().replace(/\?.*/, '').replace(/\/$/, '');

  if (url != req.url)
    res.redirect(url);
  else
    next();
});

var db = require('./db');
var router = require('./router')(app);
var auth = require('./auth')(app, db, router);

require('./users')(db);
require('./categories')(db, router, auth);
require('./posts')(db, router, auth);
require('./invitations')(db, router, auth);

router.register('index', '/');
router.get(router.url('index'), function (req, res) {
  db.model('Category').find({}, function (err, categories) {
    if (err)
      return next(err);

    res.render('index', {
      title: 'index',
      categories: categories
    });
  });
});

app.set('view engine', 'ejs');
app.dynamicHelpers({
  router: function () {
    return router;
  }
});

app.listen(config.port);
