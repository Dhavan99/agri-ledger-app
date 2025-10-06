// hash_password.js
const bcrypt = require('bcryptjs');

// The new password is set here
const newPassword = 'Azsxdcfv987';

const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(newPassword, salt);

console.log("New password hash for 'Test':");
console.log(hash);