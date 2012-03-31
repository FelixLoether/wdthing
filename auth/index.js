var config = require('./config');
var everyauth = require('everyauth');
var google = require('./google');
var users = {};

module.exports = function (app, db, router) {
  // Stuff used by all modules.
  require('./everymodule')(everyauth.everymodule, users);
  var handlers = require('./handlers')(db, users);

  // Add the auth types.
  google(everyauth, config, handlers);

  // Make sure the middleware is used.
  everyauth.helpExpress(app);
  app.use(everyauth.middleware());
  
  // Register needed urls.
  require('./routes')(router, config);
  
  // Return middleware for login requirement.
  return function (req, res, next) {
    if (req.user)
      next();
    else
      res.redirect(router.url('login'), 403);
  };
};

