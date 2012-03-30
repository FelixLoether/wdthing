module.exports = function (db) {
  var Tag = new db.Schema({
    name: {
      type: String,
      match: /[\w\- ]/,
      required: true,
      unique: true
    },
    count: {
      type: Number,
      min: 0
    }
  });

  db.model('Tag', Tag);
};
