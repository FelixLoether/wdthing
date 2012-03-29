module.exports = function (app) {
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

  var router = Object.create(app);

  router.register = register;
  router.url = url;
  router.link = link;

  return router;
};
