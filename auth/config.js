var secret = require('./secret-config');

module.exports = {
  loginPath: '/login',
  redirectPath: '/auth/redirect',
  google: {
    id: secret.google.id,
    secret: secret.google.secret,
    scope: 'https://www.googleapis.com/auth/userinfo.email'
  }
};
