var socket = io.connect('http://localhost:8080');
$(document).ready(function() {
  console.log('socket connected');
  socket.on('connect', function () {
    socket.send(window.location.href);
  });

  window.onhashchange = function () {
    socket.send(window.location.href);
  }
});
  