const crypto = require('crypto');

function createSalt(length) {
  return(crypto.randomBytes(Math.ceil(length / 2))
               .toString('hex')
               .slice(0, length));
}

function sha512(password, salt) {
  let hash = crypto.createHmac('sha512', salt);
  hash.update(password);
  hash = hash.digest('hex');
  return({ salt: salt, hash: hash });
}

function handlePassword(password, salt=null) {
  if(salt === null) { salt = createSalt(16); }
  return(sha512(password, salt));
}

module.exports = handlePassword;