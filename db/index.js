var config = require('./config');
var mongoose = require('mongoose');

mongoose.connect(config.uri);

module.exports = mongoose;
