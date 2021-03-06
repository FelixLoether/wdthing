module.exports = function (db) {
  var User = new db.Schema({
    name: {
      type: String,
      match: /[\w\- ]/,
      required: true,
      unique: true
    },
    id: {
      type: String,
      index: true,
      required: true,
      unique: true
    }
  });

  db.model('User', User);
};

