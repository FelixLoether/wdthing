module.exports = function (app) {
  app.error(function (err, req, res, next) {
    res.render('error', {
      title: 'Error!',
      error: err
    });
  });

  app.get('*', function (req, res, next) {
    var e = new Error('Cannot find URL ' + req.url);
    e.name = 404;
    next(e);
  });

  process.on('uncaughtException', function (err) {
    console.log(err);
  });
};
