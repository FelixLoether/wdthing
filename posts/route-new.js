module.exports = function (db, router, auth, marked, prepareEdit) {
  router.register('new-post', '/new-post');

  router.get(router.url('new-post'), auth, function (req, res) {
    res.render('post-new', {
      title: 'create post'
    });
  });

  var Post = db.model('Post');
  router.post(router.url('new-post'), auth, prepareEdit,
              function (req, res, next) {
    if (!req.body.category)
      return next();

    var p = new Post();
    p.title = req.body.title;
    p.slug = req.body.slug;
    p.tags = req.body.tags;
    p.rawContent = req.body.content;
    p.content = marked(req.body.content);
    p.category = req.body.category;
    p.categoryid = req.body.category._id;

    p.save(function (err) {
      if (err)
        return next(err);

      res.redirect(router.url('post', p), 303);
    });
  });
};
