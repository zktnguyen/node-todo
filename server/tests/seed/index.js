const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const { Todo } = require('../../models/todo');
const { User } = require('../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const seedUsers = [{
  _id: userOneId,
  email: 'ethan@example.com',
  password: 'useronepass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId, access: 'auth'}, process.env.JWT_SECRET).toString()
  }]
},
{
  _id: userTwoId,
  email: 'mason@example.com',
  password: 'userTwoPass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userTwoId, access: 'auth'}, process.env.JWT_SECRET).toString()
  }]
}];

const seedTodos = [{ 
  _id: new ObjectID(), 
  text: 'first test todo',
  _creator: userOneId
}, 
{ 
  _id: new ObjectID(), 
  text: 'second test todo',
  completed: true,
  completedAt: 333,
  _creator: userTwoId
}];

const populateTodos = done => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(seedTodos);
  }).then(() => done());
};

const populateUsers = done => {
  User.remove({}).then(() => {
    let userOne = new User(seedUsers[0]).save();
    let userTwo = new User(seedUsers[1]).save();
    return Promise.all([userOne, userTwo]);
  }).then(() => done());
};

module.exports = { 
  seedTodos, 
  populateTodos,
  seedUsers,
  populateUsers
};
