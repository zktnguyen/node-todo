const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('../');
const { Todo } = require('../models/todo');
const { User } = require('../models/user');
const { seedTodos, populateTodos, 
  seedUsers, populateUsers } = require('./seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
  it('should create a new todo', done => {
    let text = 'Test todo text';
    request(app)
      .post('/todos')
      .set('x-auth', seedUsers[0].tokens[0].token)
      .send({ text })
      .expect(200)
      .expect(res => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({text}).then(todos => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch(e => done(e));
      });
  });

  it('should not create a new todo with invalid body', done => {
    request(app)
      .post('/todos')
      .set('x-auth', seedUsers[0].tokens[0].token)
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) { return done(err); }
        Todo.find().then(todos => {
          expect(todos.length).toBe(2);
          done();
        }).catch(e => done(e));
      });
  });
});

describe('GET /todos', () => {
  it('should get all the todos', done => {
    request(app)
      .get('/todos')
      .set('x-auth', seedUsers[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(1);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should get a todo with id', done => {
    request(app)
      .get(`/todos/${seedTodos[0]._id.toHexString()}`)
      .set('x-auth', seedUsers[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(seedTodos[0].text);
      })
      .end(done);
  });
  
  it('should return 404 if todo is not found', done => {
    request(app)
      .get(`/todos/${(new ObjectID()).toHexString()}`)
      .set('x-auth', seedUsers[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', done => {
    request(app)
      .get('/todos/123')
      .set('x-auth', seedUsers[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should not return todo doc created by other user', done => {
    request(app)
      .get(`/todos/${seedTodos[1]._id.toHexString()}`)
      .set('x-auth', seedUsers[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should remove todo with id', done => {
    let hexId = seedTodos[1]._id.toHexString();
    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', seedUsers[1].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(hexId);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(hexId).then((todo) => {
          expect(todo).toBe(null);
          done();
        }).catch(e => done(e));
      });
  });

  it('should not remove todo user did not create', done => {
    let hexId = seedTodos[0]._id.toHexString();
    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', seedUsers[1].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(hexId).then((todo) => {
          expect(todo).toBeTruthy();
          done();
        }).catch(e => done(e));
      });
  });
  
  it('should return 404 if todo is not found', done => {
    request(app)
      .delete(`/todos/${(new ObjectID()).toHexString()}`)
      .set('x-auth', seedUsers[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 for valid object id', done => {
    request(app)
      .delete('/todos/123')
      .set('x-auth', seedUsers[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('should update the todo', done => {
    let hexId = seedTodos[0]._id.toHexString();
    const text = 'something new';
    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', seedUsers[0].tokens[0].token)
      .send({
        completed: true,
        text
      })
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true);
        expect(typeof res.body.todo.completedAt).toBe('number');
      })
      .end(done);
  });

  it('should not update the todo created by other user', done => {
    let hexId = seedTodos[0]._id.toHexString();
    const text = 'something new';
    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', seedUsers[1].tokens[0].token)
      .send({
        completed: true,
        text
      })
      .expect(404)
      .end(done);
  });

  it('should clear completedAt when todo is not completed', done => {
    let hexId = seedTodos[1]._id.toHexString();
    let text = 'next text';
    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', seedUsers[1].tokens[0].token)
      .send({
        completed: false,
        text
      })
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toBe(null);
      })
      .end(done);
  });

});

describe('GET /users/me', () => {
  it('should return user if authenticated', done => {
    request(app)
      .get('/users/me')
      .set('x-auth', seedUsers[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body._id).toBe(seedUsers[0]._id.toHexString());
        expect(res.body.email).toBe(seedUsers[0].email);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', done => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect(res => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', done => {
    const email = 'kimt@example.com';
    const password = 'sdflkmsdfl1222';

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).toBeTruthy();
        expect(res.body._id).toBeTruthy();
        expect(res.body.email).toEqual(email);
      })
      .end(err => {
        if(err) {
          return done(err);
        }
        User.findOne({email}).then(user => {
          expect(user).toBeTruthy();
          done();
        }).catch(e => done(e));
      });
  });

  it('should return validation errors if request is invalid', done => {
    request(app)
      .post('/users')
      .send({ email: 'and', password: 'slm'})
      .expect(400)
      .end(done);
  });

  it('should not create user if email is used', done => {
    
    request(app)
      .post('/users')
      .send({ 
        email: seedUsers[0].email, 
        password: 'adsfklsmdflk22' 
      })
      .expect(400)
      .end(done);
  });
});

describe('POST /users/login', () => {
  it('should login user and return auth token', done => {
    request(app)
      .post('/users/login')
      .send({
        email: seedUsers[1].email,
        password: seedUsers[1].password
      })
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).toBeTruthy();
      })
      .end((err, res) => {
        if (err) {
          done(err);
        }

        User.findById(seedUsers[1]._id).then(user => {
          expect(user.tokens[1].access).toBe('auth');
          expect(user.tokens[1].token).toBe(res.headers['x-auth']);
          done();
        }).catch(e => done(e));
      });
  });

  it('should reject invalid login', done => {
    request(app)
      .post('/users/login')
      .send({
        email: seedUsers[1].email,
        password: 'selkdmslkfm'
      })
      .expect(400)
      .expect(res => {
        expect(res.headers['x-auth']).toBeFalsy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findById(seedUsers[1]._id).then(user => {
          expect(user.tokens.length).toBe(1);
          done();
        }).catch(e => done(e));
      });
  });
});


describe('DELETE /users/me/token', () => {
  it('should remove auth token to logout', done => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', seedUsers[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
        }

        User.findById(seedUsers[0]._id).then(user => {
          expect(user.tokens.length).toBeFalsy();
          done();
        }).catch(e => done(e));
      });
  });
});