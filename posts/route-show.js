module.exports = function (db, router, findPost) {
  router.register('post', '/:cat/:id', function (post) {
    return router.url('category', post.category) + '/' + post.slug;
  });

  router.get(router.url('post'), findPost, function (req, res, next) {
    if (!req.post || !req.category)
      return next();

    req.post.category = req.category;

    res.render('post', {
      title: req.post.title
    });
  });
};
