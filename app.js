var config = require('./config');
var express = require('express');
var seq = require('seq');
var marked = require('marked');
var moment = require('moment');

marked.setOptions({
  gfm: true,
  pedantic: false,
  sanitize: true
});

var app = express.createServer();
app.use(express['static'](__dirname + '/public'));
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
var CategorySchema = require('./categories')(db, router, auth);
var PostSchema = require('./posts')(db, router, auth, marked);
require('./invitations')(db, router, auth);

router.register('index', '/');
router.get(router.url('index'), function (req, res) {
  var posts = [];

  seq().seq(function () {
    db.model('Post').find({}).desc('date').run(this);
  }).flatten()
  .parMap(function (post, i) {
    posts[i] = post;
    db.model('Category').findById(post.categoryid, this);
  }).seq(function () {
    var i;

    for (i = 0; i < arguments.length; i += 1)
      posts[i].category = arguments[i];

    res.render('index', {
      title: 'index',
      posts: posts
    });
  });
});

var categories = [];

var updateCategories = function () {
  seq().seq(function () {
    db.model('Category').find({}).asc('weekday').run(this);
  }).flatten()
  .parMap(function (category, i) {
    categories[i] = category;

    db.model('Post').findOne({categoryid: category._id}).desc('date').limit(1)
      .run(this);
  }).seq(function () {
    var i;

    for (i = 0; i < arguments.length; i += 1) {
      arguments[i].category = categories[i];
      categories[i].post = arguments[i];
    }
  });
};

CategorySchema.post('save', updateCategories);
PostSchema.post('save', updateCategories);

updateCategories();

app.set('view engine', 'ejs');

app.dynamicHelpers({
  category: function (req) {
    return req.category;
  },
  post: function (req) {
    return req.post;
  },
  router: function () {
    return router;
  },
  categories: function () {
    return categories;
  },
  moment: function () {
    return moment;
  }
});


app.listen(config.port);
