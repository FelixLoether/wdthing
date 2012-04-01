var config = require('./config');
var express = require('express');
var moment = require('moment');
var marked = require('marked');

marked.setOptions({
  gfm: true,
  pedantic: false,
  sanitize: true
});

var app = express.createServer();
require('./middleware')(app, express, config);

var db = require('./db');
var router = require('./router')(app);
var auth = require('./auth')(app, db, router);

require('./users')(db);
require('./categories')(db, router, auth);
require('./posts')(db, router, auth, marked);
require('./invitations')(db, router, auth);
require('./route-index')(db, router);

var categories = require('./live-categories')(db);

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
