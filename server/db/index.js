var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI, { useMongoClient: true });

module.exports = { mongoose };
