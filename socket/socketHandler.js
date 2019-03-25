const EventEmitter = require('events');

class SocketEmitter extends EventEmitter {
}

const socketEmitter = new SocketEmitter();

module.exports = {
  socketHandler: (socket) => {
    console.log('a client connected');

    socket.on('listenToSubmit', function (submitId) {
      socketEmitter.on('judgeEnd', submit => {
        if (submit._id === submitId) {
          socket.emit('result', submit);
        }
      })
    });

    socket.on('disconnect', function () {
      console.log('a client disconnect');
    });
  },
  socketEmitter,
};