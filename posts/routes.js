module.exports = function (db, router, auth, marked) {
  var prepareEdit = function (req, res, next) {
    req.body.slug = (req.body.slug || req.body.title).replace(/\W+/g, '-')
      .replace(/-$/, '').toLowerCase();
    req.body.tags = req.body.tags.split(/\s+/);

    db.model('Category').findOne({name: req.body.category}, function(err, cat) {
      if (err)
        return next(err);

      req.body.category = cat;
      next();
    });
  };

  var findPost = function (req, res, next) {
    var id = req.params.id;

    db.model('Post').findOne({slug: id}, function (err, post) {
      if (err)
        return next(err);

      if (!post)
        return next();

      db.model('Category').findById(post.categoryid, function (err, cat) {
        if (err)
          return next(err);

        if (cat && cat.slug != req.params.cat)
          cat = null;

        req.category = cat;
        req.post = post;
        next();
      });
    });
  };

  require('./route-new')(db, router, auth, marked, prepareEdit);
  require('./route-show')(db, router, findPost);
  require('./route-edit')(db, router, auth, marked, prepareEdit, findPost);
};
