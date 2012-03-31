module.exports = function (everymodule, users) {
  everymodule.findUserById(function (id, cb) {
    if (users[id])
      cb(null, users[id]);
    else
      cb('Invalid user: ' + id);
  });

  everymodule.handleLogout(function (req, res) {
    if (req.user)
      delete users[req.user.id];

    req.logout();
    this.redirect(res, req.session.redirectUrl || this.logoutRedirectPath());
  });
};
