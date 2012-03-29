module.exports = function () {
  var urls = {};

  var register = function (name, url, filler) {
    filler = filler || function () { return url; };
    urls[name] = [url, filler];
  };

  var url = function (name, data) {
    if (!urls[name])
      throw new Error('URL named ' + name + ' does not exist!');

    if (data)
      return urls[name][1](data);
    else
      return urls[name][0];
  };

  var link = function (name, text, data) {
    return '<a href="' + url(name, data) + '">' + text + '</a>';
  };

  var gets = [];
  var posts = [];

  var get = function (url, cb) {
    gets.push([url, cb]);
  };

  var post = function (url, cb) {
    posts.push([url, cb]);
  };

  var router = function (app) {
    gets.forEach(function (e) {
      app.get(e[0], e[1]);
    });

    posts.forEach(function (e) {
      app.post(e[0], e[1]);
    });
  };

  router.register = register;
  router.url = url;
  router.link = link;
  router.get = get;
  router.post = post;

  return router;
};
