var seq = require('seq');

module.exports = function (db) {
  var categories = [];

  var updateCategories = function () {
    seq().seq(function () {
      db.model('Category').find({}).asc('weekday').run(this);
    }).flatten().parMap(function (category, i) {
      categories[i] = category;

      db.model('Post').findOne({categoryid: category._id})
                      .desc('date')
                      .limit(1)
                      .run(this);
    }).seq(function () {
      for (var i = 0; i < arguments.length; i += 1) {
        arguments[i].category = categories[i];
        categories[i].post = arguments[i];
      }
    });
  };

  db.model('Category').schema.post('save', updateCategories);
  db.model('Category').schema.post('remove', updateCategories);
  db.model('Post').schema.post('save', updateCategories);
  db.model('Post').schema.post('remove', updateCategories);

  updateCategories();

  return categories;
};
