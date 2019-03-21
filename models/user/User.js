const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../../config');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
});

UserSchema.methods.generateToken = function () {
    return jwt.sign({id: this._id}, config.secret, {
        expiresIn: 86400    // one day
    });
};

UserSchema.methods.validatePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
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

mongoose.model('User', UserSchema);
