module.exports = function (db, users) {
  var handleInvitation = function (sess, promise, name, auth) {
    var userCreated = function (err) {
      if (err)
        return promise.fulfill([err]);

      users[auth] = user;
      promise.fulfill(user);
    };

    var User = db.model('User');
    var createUser = function () {
      var user = new User();
      user.id = auth;
      user.name = name;
      user.save(userCreated);
    };

    var invitationRemoved = function (err) {
      if (err)
        return promise.fulfill([err]);

      delete sess.invitation;
      createUser();
    };

    var invitationFound = function (err, invitation) {
      if (err)
        return promise.fulfill([err]);

      invitation.remove(invitationRemoved);
    };

    db.model('Invitation').findOne({id: sess.invitation}, invitationFound);
  };

  var findOrCreateUser = function (sess, service, id, name, promise) {
    var auth = service + '-' + id;

    if (sess && sess.invitation) {
      handleInvitation(sess, promise, name, auth);
      return promise;
    }

    if (users[auth])
      return users[auth];

    db.model('User').findOne({id: auth}, function (err, user) {
      if (err)
        return promise.fulfill([err]);

      if (!user)
        return promise.fulfill([new Error('User not found')]);

      users[auth] = user;
      promise.fulfill(user);
    });

    return promise;
  };

  var handleFail = function (req, res) {
    res.redirect(router.url('login'), 303);
  };

  return {
    findOrCreateUser: findOrCreateUser,
    handleFail: handleFail
  };
};
