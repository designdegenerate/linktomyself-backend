const mongoose = require('mongoose');
const { Schema, SchemaTypes, model } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  page: {
    type: SchemaTypes.ObjectId,
    ref: 'Page',
  }
});

const User = model('User', userSchema);
module.exports = User;