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
  require('./routes')(db, router, auth);
  return Category;
};
