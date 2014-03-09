$(document).ready(function() {
  $('#add-feedback').click(function() {
    socket.emit('addFeedback', {feedback: $('#feedback').val()});
  });
  
  socket.on('addSuccess', function (data) {
    var html = "<div class='alert alert-success'> <i class='icon-ok'></i> Feedback created!</div>";
    $(html).hide().appendTo('h3').fadeIn("fast").delay("2000").fadeOut("fast");
  });
});

