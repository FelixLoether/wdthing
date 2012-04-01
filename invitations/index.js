var connect = require('connect');

module.exports = function (db, router, auth) {
  var Invitation = new db.Schema({
    id: {type: String, index: true, required: true, unique: true}
  });

  db.model('Invitation', Invitation);

  router.register('invite', '/invite');
  router.get(router.url('invite'), auth, function (req, res) {
    var I = db.model('Invitation');
    var inv = new I();
    inv.id = connect.utils.uid(50);
    inv.save(function (err) {
      if (err)
        return res.end(err);

      res.end('Please point the invited person to this url:\n' +
             router.url('invitation', inv));
    });
  });

  router.register('invitation', '/invitation/:id', function (inv) {
    return '/invitation/' + inv.id;
  });

  router.get(router.url('invitation'), function (req, res) {
    if (req.user)
      return res.redirect(router.url('index'));

    if (req.params.id)
      req.session.invitation = req.params.id;
    res.redirect(router.url('login'));
  });
};
