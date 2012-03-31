module.exports = function (db, router, auth, marked, prepareEdit, findPost) {
  var url = router.url('post') + '/edit';
  router.register('edit-post', url, function (post) {
    return router.url('post', post) + '/edit';
  });

  router.get(router.url('edit-post'), auth, findPost, function (req, res, next){
    if (!req.post || !req.category)
      return next();

    res.render('post-edit', {
      title: 'edit ' + req.post.title
    });
  });

  router.post(router.url('edit-post'), auth, prepareEdit, findPost,
              function (req, res, next) {
    if (!req.body.category || !req.post || !req.category)
      return next();

    var p = req.post;
    p.title = req.body.title;
    p.tags = req.body.tags;
    p.rawContent = req.body.content;
    p.content = marked(p.rawContent);
    p.categoryid = req.body.category._id;
    p.categorySlug = req.body.category.slug;

    p.save(function (err) {
      if (err)
        return next(err);

      res.redirect(router.url('post', p), 303);
    });
  });
};
