var mongoose = require('mongoose');

var { Schema } = mongoose;
var todoSchema = new Schema({
  text: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Number
  },
  _creator: {
    type: Schema.Types.ObjectId,
    required: true
  }
});

var Todo = mongoose.model('Todo', todoSchema);

module.exports = { Todo };
