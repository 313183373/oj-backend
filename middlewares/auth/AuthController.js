const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const User = require('../../models/user/User');
const verifyToken = require('./VerifyToken');

router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());

router.post('/register', (req, res) => {
    const hashedPassword = bcrypt.hashSync(req.body.password, 8);
    User.create({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
    }, function (err, user) {
        if (err) {
            return res.status(500).send("There was a problem registering the user");
        }
        const token = user.generateToken();
        res.status(200).send({
            auth: true,
            token: token,
        });
    })
});

router.get('/me', verifyToken, (req, res) => {
    User.findById(req.userId, {password: 0}, (err, user) => {
        if (err) {
            return res.status(500).send("There was a problem finding the user.");
        }
        if (!user) {
            return res.status(404).send('No user found.');
        }
        res.status(200).send({user: user, token: req.decoded});
    });
});

router.post('/login', (req, res) => {
    User.findOne({email: req.body.email}, (err, user) => {
        if (err) {
            return res.status(500).send('Error on the server!');
        }
        if (!user) {
            return res.status(404).send('No user found.');
        }
        if (!user.validatePassword(req.body.password)) {
            return res.status(401).send({auth: false, token: null});
        }
        const token = user.generateToken();
        res.status(200).send({auth: true, token: token});
    })
});

router.get('/logout', (req, res) => {
    res.status(200).send({
        auth: false,
        token: null,
    })
});

module.exports = router;