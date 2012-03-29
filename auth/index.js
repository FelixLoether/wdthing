var config = require('./config');
var everyauth = require('everyauth');
var google = require('./google');
var users = {};

module.exports = function (app, db, router) {
  // Register needed urls.
  router.register('login', config.loginPath);
  router.get(router.url('login'), function (req, res) {
    req.session.redirectUrl = req.headers.referer;
    // TODO: Show the login options.
    res.end(req.user);
  });

  router.get(config.redirectPath, function (req, res) {
    var url = req.session.redirectUrl || router.url('index');
    delete req.session.redirectUrl;
    res.redirect(url, 303);
  });

  // Stuff used by all modules.
  //everyauth.everymodule.userPkey('auth');

  everyauth.everymodule.findUserById(function (id, cb) {
    console.log('finding...');
    if (users[id]) {
      console.log('found', users[id]);
      cb(null, users[id]);
    }
    else
      cb('Invalid user: ' + id);
  });

  everyauth.everymodule.handleLogout(function (req, res) {
    if (req.user)
      delete users[req.user.id];
    req.logout();
    this.redirect(res, req.session.redirectUrl || this.logoutRedirectPath());
  });

  var findOrCreateUser = function (type, id, name, promise) {
    var auth = type + '-' + id;
    if (users[auth]) {
      console.log('Found cached', users[auth]);
      return users[auth];
    }

    var User = db.model('User');

    User.findOne({id: auth}, function (err, user) {
      if (user) {
        users[auth] = user;
        console.log('db', user);
        return promise.fulfill(user);
      }

      user = new User();
      user.id = auth;
      user.name = name;
      user.save(function (err) {
        if (err) {
          console.log('create error', err);
          return promise.fulfill([err]);
        }

        users[auth] = user;
        console.log('created', user);
        return promise.fulfill(user);
      });
    });

    return promise;
  };

  // Add the auth types.
  google(everyauth, config, findOrCreateUser);

  // Make sure the middleware is used.
  everyauth.helpExpress(app);
  app.use(everyauth.middleware());
};

