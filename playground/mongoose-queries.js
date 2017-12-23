const { ObjectID } = require('mongodb');

const { mongoose } = require('./../server/db');
const { Todo } = require('./../server/models/todo');
const { User } = require('./../server/models/user');

let id = '5a3dbea25d317e277d0de4fd';

User.findById(id).then(user => {
  if(!user) {
    return console.log('user not found');
  }
  console.log('user found', user);
}).catch(e => console.log(e));
// let id = '5a3dba7e988d1c0932aa3e2';

// if (!ObjectID.isValid(id)){ 
//   console.log('id is not valid');
// }

// Todo.find({
//   _id: id
// }).then( todos => {
//   console.log('Todos', todos);
// });

// Todo.findOne({
//   _id: id
// }).then( todo => {
//   console.log('Todo find one', todo);
// });

// Todo.findById(id).then(todo => {
//   if (!todo) {
//     return console.log('Id not found');
//   }
//   console.log('Todo by ID', todo);
// }).catch(e => console.log(e));

