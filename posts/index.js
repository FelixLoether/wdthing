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
  require('./routes')(db, router, auth, marked);
  return Post;
};
