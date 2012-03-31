module.exports = function (router, config) {
  router.register('logout', '/logout');
  router.register('login', config.loginPath);

  router.get(router.url('login'), function (req, res) {
    req.session.redirectUrl = req.headers.referer;
    res.render('login', {
      title: 'login'
    });
  });

  router.get(config.redirectPath, function (req, res) {
    var url = req.session.redirectUrl;
    delete req.session.redirectUrl;

    url = (url != router.url('login') && url) || router.url('index');

    res.redirect(url, 303);
  });
};
