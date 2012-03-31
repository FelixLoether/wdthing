module.exports = function (db, router, findCategory) {
  router.register('category', '/:id', function (cat) {
    return '/' + cat.slug;
  });

  router.get(router.url('category'), findCategory, function (req, res, next) {
    if (!req.category)
      return next();
    
    var cat = req.category;
    
    db.model('Post').find({categoryid: cat._id}).desc('date')
      .run(function (err, posts) {
        if (err)
          return next(err);

        posts = posts || [];

        for (var i = 0; i < posts.length; i += 1)
          posts[i].category = cat;

        res.render('category', {
          title: cat.name,
          posts: posts
        });
      });
  });
};
