var seq = require('seq');

module.exports = function (db, router) {
  router.register('index', '/');

  router.get(router.url('index'), function (req, res) {
    var posts = [];

    seq().seq(function () {
      db.model('Post').find({}).desc('date').run(this);
    }).flatten().parMap(function (post, i) {
      posts[i] = post;
      db.model('Category').findById(post.categoryid, this);
    }).seq(function () {
      for (var i = 0; i < arguments.length; i += 1)
        posts[i].category = arguments[i];

      res.render('index', {
        title: 'index',
        posts: posts
      });
    });
  });
};
