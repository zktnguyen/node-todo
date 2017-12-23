require('./config');
var express = require('express');
var bodyParser = require('body-parser');
var { ObjectID } = require('mongodb');
var _ = require('lodash');

var { mongoose } = require('./db');
var { Todo } = require('./models/todo');
var { User } = require('./models/user');
var { authenticate } = require('./middleware/authenticate');

var app = express();

const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  var todo = new Todo({
    text: req.body.text
  });
  todo.save().then(doc => {
    res.status(200).send(doc);
  }, e => {
    res.status(400).send(e);
  });
});

app.get('/todos', (req, res) => {
  Todo.find().then(todos => {
    res.send({todos});
  }, e => {
    res.status(400).send(e);
  });
});

app.get('/todos/:id', (req, res) => {
  const { id } = req.params;
  
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findById(id).then(todo => {
    if (!todo) {
      return res.status(404).send();
    }
    res.send({ todo });
  }).catch(e => res.status(400).send());
});

app.delete('/todos/:id', (req, res) => {
  const { id } = req.params;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findByIdAndRemove(id).then(todo => {
    if (!todo) {
      return res.status(404).send();
    }
    res.send({ todo });
  }).catch(e => res.status(400).send());
});

app.patch('/todos/:id', (req, res) => {
  const { id } = req.params;
  let body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id, {$set: body}, {new: true})
    .then(todo => {
      if (!todo) {
        return res.status(404).send();
      }

      res.send({todo});
    }).catch(e => res.status(400).send());

});

app.post('/users', (req,res) => {
  let body = _.pick(req.body, ['email', 'password']);

  let newUser = new User({
    email: body.email,
    password: body.password
  });
  
  newUser.save().then(() => {
    return newUser.generateAuthToken();
  }).then(token => {
    res.header('x-auth', token).send(newUser.toAuthJSON());
  }).catch(e => res.status(400).send({e}));
});

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.listen(port, () => console.log('Started on port 3000'));

module.exports = { app };
