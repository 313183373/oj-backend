const express = require('express');
const morgan = require('morgan');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const handleSocket = require('./socket/socketHandler');
require('./db');
require('./models/problem/Problem');
require('./models/user/User');
require('./models/submit/Submit');

io.on('connection', handleSocket);

const UserController = require('./middlewares/user/UserController');
const ProblemController = require('./middlewares/problem/ProblemController');

const PORT = 5000;

app.use(morgan('dev'));
app.use('/user', UserController);
app.use('/problems', ProblemController);

http.listen(PORT);
