var instalib = require('../libs/instalib');

module.exports = {
  getIndex: function(req, res) {
    res.render('index');
  },
  
  dashboard: function(req, res) {
    instalib.getUserById(req.session._id, function(err, user) {
	  instalib.getFeedbacks(user.token, 10, function(err, feedbacks) {
	    if (req.xhr) {
          var data = [];
          for (var i = 0; i < feedbacks.length; i++) {
            data.push({feedback: feedbacks[i]});
          }
	    	
	      res.json(feedbacks);
	    } 
	    else {
	      res.render('dashboard', {token: user.token, limit: 10});
	    }
	  });
	});
  },

  signup: function(req, res) {
    var email = req.body.email;
    var password = req.body.password;
    
    instalib.createUser(email, password, function(err, user) {
      console.log(user);
      res.redirect('/dashboard');
    });
  },

  signin: function(req, res) {
    var email = req.body.emailid;
    var password = req.body.passwd;

    console.log(email);
    console.log(password);
    
    instalib.authenticate(email, password, function(err, id) {
      console.log(id);
      if (id) {
        req.session._id = id;
        req.session.email = email;
        
        res.redirect('/dashboard');
      }
      else {
        res.redirect('/');  
      }
    });
  },

  signout: function(req, res) {
    
  },
  
  getUser: function(req, res) {
    instalib.getUser(req.params.name, function(err, user) {
      if (user) 
        res.send('1');
      else
        res.send('0');
    });
  },
  
  getFeedbacks: function(req, res) {
	instalib.getFeedbacks(req.params.token, 10, function(err, feedbacks) {
	  res.send(feedbacks);
	});
  },
  
  addFeedback: function(req, res) {
    if (req.xhr) {
      instalib.getUserById(req.session._id, function(err, user) {
        instalib.createFeedback(user.token, req.body.feedback, function(err, feedback) {
          res.send(feedback);
        });
      });
	} 
  }
  
}