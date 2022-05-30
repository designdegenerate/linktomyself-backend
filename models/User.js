const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
  },
});

const User = model('User', userSchema);
module.exports = User;