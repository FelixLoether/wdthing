module.exports = function (everyauth, config, handlers) {
  everyauth.google
    .appId(config.google.id)
    .appSecret(config.google.secret)
    .scope(config.google.scope)
    .redirectPath(config.redirectPath)
    .handleAuthCallbackError(handlers.handleFail)
    .findOrCreateUser(function (session, t, te, data, rest) {
      return handlers.findOrCreateUser(
        session, 'google', data.id, data.name, this.Promise(), rest.req.next);
    });
};
