module.exports = function (db, router, auth) {
  var findCategory = function (req, res, next) {
    var id = req.params.id;

    db.model('Category').findOne({slug: id}, function (err, cat) {
      if (err)
        return next(err);

      req.category = cat;
      next();
    });
  };

  var prepareEdit = function (req, res, next) {
    req.body.slug = (req.body.slug || req.body.name).replace(/\W+/g, '-')
      .replace(/-$/, '').toLowerCase();
    req.body.weekday = +req.body.weekday;

    if (!req.body.writer)
      return next();

    db.model('User').findOne({name: req.body.writer}, function (err, user) {
      if (err)
        return next(err);

      req.body.writer = user;
      next();
    });
  };

  require('./route-new')(db, router, auth, prepareEdit);
  require('./route-show')(db, router, findCategory);
  require('./route-edit')(db, router, auth, prepareEdit, findCategory);
};
