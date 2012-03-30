module.exports = function (db, router, auth) {
  var Post = new db.Schema({
    title: {
      type: String,
      required: true
    },
    slug: {
      type: String,
      match: /[\w\-]/,
      required: true,
      unique: true,
      index: true
    },
    category: {
      type: db.Schema.ObjectId,
      required: true,
      index: true
    },
    content: {
      type: String,
      required: true
    },
    tags: {
      type: Array,
      index: true
    },
    date: {
      type: Date,
      'default': Date.now,
      required: true
    }
  });

  db.model('Post', Post);
  Post = db.model('Post');

  router.register('new-post', '/new-post');
  router.get(router.url('new-post'), auth, function (req, res) {
    res.render('post-new', {title: 'create post'});
  });

  var prepareEdit = function (req, res, next) {
    req.body.slug = (req.body.slug || req.body.title)
      .replace(/\W+/g, '-').replace(/-$/, '').toLowerCase();
    req.body.tags = req.body.tags.split(/\s+/);

    db.model('Category').findOne({name: req.body.category}, function (err, cat){
      if (err)
        return next(err);

      req.body.category = cat;
      next();
    });
  };

  router.post(router.url('new-post'), auth, prepareEdit,
              function (req, res, next) {
    if (!req.body.category)
      return next();

    var p = new Post();
    p.title = req.body.title;
    p.slug = req.body.slug;
    p.tags = req.body.tags;
    p.content = req.body.content;
    p.category = req.body.category._id;

    p.save(function (err) {
      if (err)
        return next(err);

      res.redirect(router.url('post', {cat: req.body.category, post: p}), 303);
    });
  });

  router.register('post', '/:cat/:id', function (obj) {
    var cat = obj.cat, post = obj.post;
    return '/' + cat.slug + '/' + post.slug;
  });

  var findPost = function (req, res, next) {
    var id = req.params.id;

    Post.findOne({slug: id}, function (err, post) {
      if (err)
        return next(err);

      if (!post)
        return next();

      db.model('Category').findById(post.category, function (err, cat) {
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

  router.get(router.url('post'), findPost, function (req, res, next) {
    var post = req.post;
    var cat = req.category;

    if (!post || !cat)
      return next();

    res.render('post', {
      title: post.title,
      post: post,
      category: cat
    });
  });

  router.register('edit-post', '/:cat/:id/edit', function (obj) {
    var cat = obj.cat, post = obj.post;
    return '/' + cat.slug + '/' + post.slug + '/edit';
  });

  router.get(router.url('edit-post'), auth, findPost, function (req, res, next){
    var post = req.post;
    var cat = req.category;

    if (!post || !cat)
      return next();

    res.render('post-edit', {
      title: 'edit ' + post.title,
      post: post,
      category: cat
    });
  });

  router.post(router.url('edit-post'), auth, prepareEdit, findPost,
              function (req, res, next) {
    if (!req.body.category)
      return next();
    if (!req.post || !req.category)
      return next();

    var p = req.post;
    p.title = req.body.title;
    p.tags = req.body.tags;
    p.content = req.body.content;
    p.category = req.body.category._id;

    p.save(function (err) {
      if (err)
        return next(err);

      res.redirect(router.url('post', {cat: req.body.category, post: p}), 303);
    });
  });
};
