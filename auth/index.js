var config = require('./config');
var everyauth = require('everyauth');
var google = require('./google');
var users = {};

module.exports = function (app, db, router) {
  // Stuff used by all modules.
  everyauth.everymodule.findUserById(function (id, cb) {
    if (users[id])
      cb(null, users[id]);
    else
      cb('Invalid user: ' + id);
  });

  everyauth.everymodule.handleLogout(function (req, res) {
    if (req.user)
      delete users[req.user.id];
    req.logout();
    this.redirect(res, req.session.redirectUrl || this.logoutRedirectPath());
  });

  var findOrCreateUser = function (session, type, id, name, promise) {
    var auth = type + '-' + id;

    if (session && session.invitation) {
      var user;

      var userCreated = function (err) {
        if (err)
          return promise.fulfill([err]);

        users[auth] = user;
        promise.fulfill(user);
      };

      var createUser = function (err) {
        var u = db.model('User');
        user = new u();
        user.id = auth;
        user.name = name;
        user.save(userCreated);
      };

      var removeInvitation = function (err) {
        if (err)
          return promise.fulfill([err]);

        delete session.invitation;
        createUser();
      };

      var invitationFound = function (err, invitation) {
        if (err)
          return promise.fulfill([err]);

        invitation.remove(removeInvitation);
      };

      db.model('Invitation').findOne(
        {id: session.invitation}, invitationFound);

      return promise;
    }

    if (users[auth]) {
      return users[auth];
    }

    db.model('User').findOne({id: auth}, function (err, user) {
      if (err) {
        promise.fulfill([err]);
      } else if (user) {
        users[auth] = user;
        promise.fulfill(user);
      } else {
        promise.fulfill([new Error('User not found')]);
      }
    });

    return promise;
  };

  // Add the auth types.
  google(everyauth, config, findOrCreateUser);

  // Make sure the middleware is used.
  everyauth.helpExpress(app);
  app.use(everyauth.middleware());
  
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
};

