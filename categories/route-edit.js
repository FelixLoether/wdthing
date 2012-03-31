module.exports = function (db, router, auth, prepareEdit, findCategory) {
  var url = router.url('category') + '/edit';
  router.register('edit-category', url, function (cat) {
    return router.url('category', cat) + '/edit';
  });

  router.get(router.url('edit-category'), auth, findCategory,
             function (req, res, next) {
    if (!req.category)
      return next();

    var cat = req.category;
    
    db.model('User').findById(cat.writer, function (err, user) {
      if (err)
        return next(err);

      if (!user)
        return next();

      res.render('category-edit', {
        title: 'edit ' + cat.name,
        writer: user
      });
    });
  });

  router.post(router.url('edit-category'), auth, findCategory, prepareEdit,
              function (req, res, next) {
    if (!req.category)
      return next();

    var cat = req.category;
    cat.name = req.body.name;
    cat.weekday = req.body.weekday;

    if (req.body.user)
      cat.user = req.body.user._id;

    cat.save(function (err) {
      if (err)
        return next(err);

      res.redirect(router.url('category', cat), 303);
    });
  });
};
