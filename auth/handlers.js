module.exports = function (db, users) {
  var handleInvitation = function (sess, promise, name, auth, next) {
    var userCreated = function (err) {
      if (err) {
        promise.fail(err);
        return next(err);
      }

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
      if (err) {
        promise.fail(err);
        return next(err);
      }

      delete sess.invitation;
      createUser();
    };

    var invitationFound = function (err, invitation) {
      if (err) {
        promise.fail(err);
        return next(err);
      }

      if (!invitation) {
        delete sess.invitation;
        var e = new Error('Invalid invitation');
        e.name = 400;
        promise.fail(e);
        return next(e);
      }

      invitation.remove(invitationRemoved);
    };

    db.model('Invitation').findOne({id: sess.invitation}, invitationFound);
  };

  var findOrCreateUser = function (sess, service, id, name, promise, next) {
    var auth = service + '-' + id;

    if (sess && sess.invitation) {
      handleInvitation(sess, promise, name, auth, next);
      return promise;
    }

    if (users[auth])
      return users[auth];

    db.model('User').findOne({id: auth}, function (err, user) {
      if (err) {
        promise.fail(err);
        return next(err);
      }

      if (!user) {
        var e = new Error('User not found');
        e.name = 400;
        promise.fail(e);
        return next(e);
      }

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
