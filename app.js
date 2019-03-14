const express = require('express');
const morgan = require('morgan');
const app = express();
require('./db');
require('./problem/Problem');
require('./user/User');
require('./submit/Submit');

const AuthController = require('./auth/AuthController');
const JudgeController = require('./judge/JudgeController');

const PORT = 5000;

app.use(morgan('dev'));
app.use('/api/auth', AuthController);
app.use(JudgeController);

app.listen(PORT);
