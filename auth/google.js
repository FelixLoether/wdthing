module.exports = function (everyauth, config, findOrCreateUser) {
  everyauth.google
    .appId(config.google.id)
    .appSecret(config.google.secret)
    .scope(config.google.scope)
    .redirectPath(config.redirectPath)
    .findOrCreateUser(function (session, t, te, data) {
      return findOrCreateUser('google', data.id, data.name, new this.Promise());
    });
};
