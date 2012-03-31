//var config = require('./config');

module.exports = function (db, router, auth) {
  var Category = new db.Schema({
    name: {
      type: String,
      required: true,
      unique: true
    },
    slug: {
      type: String,
      match: /[\w\-]/,
      required: true,
      unique: true,
      index: true
    },
    weekday: {
      type: Number,
      required: true,
      unique: true,
      min: 0,
      max: 6
    },
    writer: db.Schema.ObjectId // User
  });

  db.model('Category', Category);
  var Cat = Category;
  Category = db.model('Category');

  router.register('new-category', '/new-category');
  router.get(router.url('new-category'), auth, function (req, res) {
    res.render('category-new', {title: 'create category'});
  });

  router.post(router.url('new-category'), auth, function (req, res, next) {
    var c = new Category();
    c.name = req.body.name;
    c.slug = req.body.slug ||
      c.name.replace(/\W+/g, '-').replace(/-$/, '').toLowerCase();
    c.weekday = +req.body.weekday;

    db.model('User').findOne({name: req.body.writer}, function (err, user) {
      if (err)
        return next(err);

      if (!user)
        return next(new Error('No such user!'));

      c.writer = user._id;
      c.save(function (err) {
        if (err)
          return next(err);

        res.redirect(router.url('category', c), 303);
      });
    });
  });

  var findCategory = function (req, res, next) {
    var id = req.params.id;

    Category.findOne({slug: id}, function (err, cat) {
      if (err)
        return next(err);

      req.category = cat;
      next();
    });
  };

  router.register('category', '/:id', function (cat) {
    return '/' + cat.slug;
  });

  router.get(router.url('category'), findCategory, function (req, res, next) {
    if (!req.category)
      return next();

    var cat = req.category;
    var Post = db.model('Post');

    Post.find({category: cat._id}).desc('date').run(function (err, posts) {
      if (err)
        return next(err);

      res.render('category', {
        title: cat.name,
        category: cat,
        posts: posts || []
      });
    });
  });

  router.register('edit-category', '/:id/edit', function (cat) {
    return '/' + cat.slug + '/edit';
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
        category: cat,
        writer: user
      });
    });
  });

  router.post(router.url('edit-category'), auth, findCategory,
              function (req, res, next) {
    if (!req.category)
      return next();

    var cat = req.category;
    cat.name = req.body.name;
    cat.weekday = req.body.weekday;

    if (req.body.user) {
      var User = db.model('User');
      User.findOne({name: req.body.user}, function (err, user) {
        if (err)
          return next(err);

        if (!user)
          return next(new Error('No such user!'));

        cat.writer = user._id;
        cat.save(function (err) {
          if (err)
            return next(err);

          res.redirect(router.url('category', cat), 303);
        });
      });
    } else {
      cat.save(function (err) {
        if (err)
          return next(err);

        res.redirect(router.url('category', cat), 303);
      });
    }
  });

  return Cat;
};
