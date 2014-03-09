$(document).ready(function() {

  $('#add-feedback').click(function() {
	socket.emit('addFeedback', {feedback: $('#feedback').val()});
  });

  socket.on('addSuccess', function (data) {
	$('.feedback-list').append('<tr><td>' + $('#feedback').val() + '</td></tr>');
  });
  
  var FeedbackModel = Backbone.Model.extend({
    defaults: {
	  visible: true
    },
    setVisible: function(visible) {
      this.set({visible: visible});
	}
  });
	  
  var FeedbackCollection = Backbone.Collection.extend({
    model: FeedbackModel,
    url: '/dashboard'
  });

  var FeedbackView = Backbone.View.extend({
    el: 'body',
    
    initialize: function() {
      var self = this;
      window.feedbackCollection = new FeedbackCollection();
      window.feedbackCollection.fetch({
        success: function() {
          self.render();
        },
        error: function() {
          console.log('Error fetching feedback');
        }
      });    
    },
	    
    render: function() {
      for (var i=0; i<window.feedbackCollection.models.length; i++) {
        var data = window.feedbackCollection.models[i];
        var rowView = new RowView({model: data});
        $('.feedback-list').append(rowView.render().el);
      }
    } 
  });
	  
  var RowView = Backbone.View.extend({
    tagName: 'tr',
    initialize: function() {
      _.bindAll(this, 'setVisibility');
      this.model.bind('change', this.setVisibility);
    },
    setVisibility: function() {
      if (!this.model.toJSON().visible) $(this.el).hide();
      else $(this.el).show();
    },
    render: function() {
      var template = _.template("<td><%=feedback%></td>");
      $(this.el).html(template(this.model.toJSON()));
      return this;
    }
  });
  
  new FeedbackView();
});
