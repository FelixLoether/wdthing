module.exports = function (db, router, auth, marked) {
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
    categorySlug: {
      type: String,
      match: /[\w\-]/,
      required: true
    },
    categoryid: {
      type: db.Schema.ObjectId,
      required: true,
      index: true
    },
    rawContent: {
      type: String,
      required: true
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
  var PostSchema = Post;
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
    p.rawContent = req.body.content;
    p.content = marked(req.body.content);
    p.categoryid = req.body.category._id;
    p.categorySlug = req.body.category.slug;

    p.save(function (err) {
      if (err)
        return next(err);

      res.redirect(router.url('post', p), 303);
    });
  });

  router.register('post', '/:cat/:id', function (post) {
    return '/' + post.categorySlug + '/' + post.slug;
  });

  var findPost = function (req, res, next) {
    var id = req.params.id;

    Post.findOne({slug: id}, function (err, post) {
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

  router.get(router.url('post'), findPost, function (req, res, next) {
    var post = req.post;
    var cat = req.category;

    if (!post || !cat)
      return next();

    res.render('post', {
      title: post.title
    });
  });

  router.register('edit-post', '/:cat/:id/edit', function (post) {
    return '/' + post.categorySlug + '/' + post.slug + '/edit';
  });

  router.get(router.url('edit-post'), auth, findPost, function (req, res, next){
    var post = req.post;
    var cat = req.category;

    if (!post || !cat)
      return next();

    res.render('post-edit', {
      title: 'edit ' + post.title
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
    p.rawContent = req.body.content;
    p.content = marked(req.body.content);
    p.categoryid = req.body.category._id;
    p.categorySlug = req.body.category.slug;

    p.save(function (err) {
      if (err)
        return next(err);

      res.redirect(router.url('post', p), 303);
    });
  });

  return PostSchema;
};
