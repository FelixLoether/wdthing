var config = require('./secret-config');
var mongoose = require('mongoose');

mongoose.connect(config.uri);

module.exports = mongoose;
