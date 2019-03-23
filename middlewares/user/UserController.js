const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const verifyToken = require('../auth/VerifyToken');
const mongoose = require("mongoose");
const {emailValidator, passwordValidator, usernameValidator} = require('../../utils/validator');

const User = mongoose.model('User');


router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());

router.post('/', async (req, res) => {
  const {username, email, password} = req.body;
  if (!username || !email || !password || !emailValidator(email) || !passwordValidator(password) || !usernameValidator(username)) {
    return res.status(400).send("Invalid parameters");
  }
  try {
    const isUnusedEmail = await User.isUnusedEmail(email);
    if (!isUnusedEmail) {
      return res.status(400).send("Email already used");
    }
    const inUnusedUsername = await User.isUnusedUsername(username);
    if (!inUnusedUsername) {
      return res.status(400).send("Username already used");
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 8);
    User.create({
      username,
      email,
      password: hashedPassword,
    }, function (err, user) {
      if (err) {
        console.error(err);
        return res.status(500).send("Server error");
      }
      const token = user.generateToken();
      res.status(200).send(token);
    })
  } catch (e) {
    console.error(e);
    return res.status(500).send("Server error");
  }
});

router.get('/me', verifyToken(), (req, res) => {
  User.findById(req.user.id, {password: 0}, (err, user) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Server error");
    }
    if (!user) {
      return res.status(404).send('No user found.');
    }
    res.status(200).json({username: user.username, email: user.email, token: req.decoded});
  });
});

router.post('/login', (req, res) => {
  const {email, password} = req.body;
  if (!email || !password || !emailValidator(email) || !passwordValidator(password)) {
    return res.status(400).send("Invalid username/password supplied");
  }
  User.findOne({email: req.body.email}, (err, user) => {
    if (err) {
      return res.status(500).send('Error on the server!');
    }
    if (!user) {
      return res.status(404).send('No user found.');
    }
    if (!user.validatePassword(req.body.password)) {
      return res.status(401).send('Password wrong');
    }
    const token = user.generateToken();
    res.status(200).json({email, username: user.username, token});
  })
});

router.get('/logout', (req, res) => {
  res.status(200).end();
});

router.get('/validate', async (req, res) => {
  const {email} = req.query;
  if (!email || !emailValidator(email)) {
    return res.status(400).end();
  } else {
    try {
      const isUnusedEmail = await User.isUnusedEmail(email);
      if (!isUnusedEmail) {
        return res.json({isUsed: true});
      }
      return res.json({isUsed: false});
    } catch (e) {
      res.status(500).send('Server error');
    }
  }
});

module.exports = router;