module.exports = function (db, router, findPost) {
  router.register('post', '/:cat/:id', function (post) {
    return '/' + post.categorySlug + '/' + post.slug;
  });

  router.get(router.url('post'), findPost, function (req, res, next) {
    if (!req.post || !req.category)
      return next();

    res.render('post', {
      title: req.post.title
    });
  });
};
