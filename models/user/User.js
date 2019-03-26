const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../../config');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  submits: [{type: mongoose.Schema.Types.ObjectId, ref: 'Submit'}]
});

UserSchema.methods.generateToken = function () {
  return jwt.sign({id: this._id}, config.secret, {
    expiresIn: 86400    // one day
  });
};

UserSchema.methods.validatePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.statics.isUnusedEmail = function (email) {
  return new Promise((resolve, reject) => {
    this.countDocuments({email}, (err, count) => {
      if (err) {
        reject(err);
      }
      resolve(count === 0);
    });
  });
};

UserSchema.statics.isUnusedUsername = function (username) {
  return new Promise((resolve, reject) => {
    this.countDocuments({username}, (err, count) => {
      if (err) {
        reject(err);
      }
      resolve(count === 0);
    });
  });
};


mongoose.model('User', UserSchema);
