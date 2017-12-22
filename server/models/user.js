var mongoose = require('mongoose');

var { Schema } = mongoose;

var userSchema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  }
});

var User = mongoose.model('User', userSchema);
module.exports = { User };
