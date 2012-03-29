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
  });

  router.get(config.redirectPath, function (req, res) {
    var url = req.session.redirectUrl || router.url('index');
    delete req.session.redirectUrl;
    res.redirect(url, 303);
  });

  // Stuff used by all modules.
  //everyauth.everymodule.userPkey('auth');

  everyauth.everymodule.findUserById(function (id, cb) {
    if (users[id])
      cb(null, users[id]);
    else
      cb('Invalid user: ' + id);
  });

  everyauth.everymodule.handleLogout(function (req, res) {
    delete users[req.user.id];
    req.logout();
    this.redirect(res, req.session.redirectUrl || this.logoutRedirectPath());
  });

  var findOrCreateUser = function (type, id, name, promise) {
    if (users[id] && users[id].auth == type)
      return users[id];

    var auth = type + '-' + id;
    var User = db.model('User');

    User.findOne({id: auth}, function (err, user) {
      if (user) {
        console.log('Found user!', id);
        users[id] = user;
        return promise.fulfill(user);
      }

      console.log('Create user', id);
      user = new User();
      user.id = auth;
      user.name = name;
      user.save(function (err) {
        if (err) {
          console.log('Error!');
          return promise.fulfill([err]);
        }

        console.log('Save user', id);
        console.log(user);
        users[id] = user;
        return promise.fulfill(user);
      });
    });

    return promise;
  };

  // Add the auth types.
  google(everyauth, config, findOrCreateUser);

  // Make sure the middleware is used.
  everyauth.helpExpress(app);
};
