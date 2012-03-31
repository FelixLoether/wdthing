module.exports = function (db, router, auth, prepareEdit) {
  var Category = db.model('Category');

  router.register('new-category', '/new-category');

  router.get(router.url('new-category'), auth, function (req, res) {
    res.render('category-new', {
      title: 'create category'
    });
  });

  router.post(router.url('new-category'), auth, prepareEdit,
              function (req, res, next) {
    var cat = new Category();
    cat.name = req.body.name;
    cat.slug = req.body.slug;
    cat.writer = req.body.writer._id;
    cat.weekday = req.body.weekday;

    cat.save(function (err) {
      if (err)
        return next(err);

      res.redirect(router.url('category', cat), 303);
    });
  });
};
