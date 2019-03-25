const EventEmitter = require('events');

class SocketEmitter extends EventEmitter {
}

const socketEmitter = new SocketEmitter();

module.exports = {
  socketHandler: (socket) => {
    console.log('a client connected');

    socket.on('listenToSubmit', function (submitId) {
      console.log('get a listenToSubmit event from client, submitId' + submitId);
      socketEmitter.on('judgeEnd', submit => {
        console.log('receive judgeEnd', submit._id);
        if (submit._id === submitId) {
          console.log('send back the result to client');
          socket.emit('result', JSON.stringify(submit));
        } else {
          console.log('submit id is not right');
        }
      })
    });

    socket.on('disconnect', function () {
      console.log('a client disconnect');
    });
  },
  socketEmitter,
};