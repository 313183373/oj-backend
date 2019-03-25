module.exports = (socket) => {
  console.log('a client connected');
  socket.on('disconnect', function () {
    console.log('a client disconnect');
  });
};
