const PasswordValidator = require('password-validator');
const emailValidator = require("password-validator");
const passwordSchema = new PasswordValidator();

passwordSchema.is().min(6).is().max(36).has().digits().has().letters().has().not().spaces();

module.exports = {
  usernameValidator: function (username) {
    const regex = /^[\w-]{5,30}$/;
    return regex.test(username);
  },
  passwordValidator: function (password) {
    return passwordSchema.validate(password);
  },
  emailValidator: function (email) {
    return emailValidator.validate(email);
  }
};
