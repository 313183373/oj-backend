const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const verifyToken = require('../auth/VerifyToken');
const emailValidator = require('email-validator');
const PasswordValidator = require('password-validator');
const mongoose = require("mongoose");

const User = mongoose.model('User');
const passwordSchema = new PasswordValidator();

passwordSchema.is().min(6).is().max(36).has().digits().has().letters().has().not().spaces();

router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());

router.post('/', async (req, res) => {
    const {name, email, password} = req.body;
    if (!name || !email || !password || !emailValidator.validate(email) || !passwordSchema.validate(password)) {
        return res.status(400).send("Invalid parameters");
    }
    let isUnusedEmail = true;
    try {
        isUnusedEmail = await User.isUnusedEmail(email);
    } catch (e) {
        console.error(e);
        return res.status(500).send("Server error");
    }
    if (!isUnusedEmail) {
        return res.status(400).send("Email already used");
    }
    const hashedPassword = bcrypt.hashSync(req.body.password, 8);
    User.create({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
    }, function (err, user) {
        if (err) {
            console.error(err);
            return res.status(500).send("Server error");
        }
        const token = user.generateToken();
        res.status(200).send(token);
    })
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
        res.status(200).send({user: user, token: req.decoded});
    });
});

router.post('/login', (req, res) => {
    const {email, password} = req.body;
    if (!email || !password || !emailValidator.validate(email) || !passwordSchema.validate(password)) {
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
        res.status(200).send(token);
    })
});

router.get('/logout', (req, res) => {
    res.status(200).end();
});

module.exports = router;