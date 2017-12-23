var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const mongoURI = process.env.MONGODB_URI || 
  'mongodb://localhost:27017/TodoApp';
mongoose.connect(mongoURI, { useMongoClient: true });

module.exports = { mongoose };
