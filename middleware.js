module.exports = function (app, express, config) {
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
};
