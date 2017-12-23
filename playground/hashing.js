const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

let password = '123abcv##';

bcrypt.genSalt(10, (err, salt) => {
  bcrypt.hash(password, salt, (err, hash) => {
    //console.log(hash);
  });
});

let hashed = '$2a$10$A.KhDbxqlFRyW5eJ2It8T.M/qWlAKmzb0QNfLbSZBnF356Jk/2d4a';

bcrypt.compare(password, hashed, (err, res) => {
  console.log(res);
});

//bcrypt.compare()
// let data = {
//   id: 10
// };

// let token = jwt.sign(data, '123abc');
// console.log(token);

// let decoded = jwt.verify(token, '123abc');
// console.log(decoded);