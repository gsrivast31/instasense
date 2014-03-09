'use strict';

var exchangeData = {};
var instalib = require('./libs/instalib');
var instaroutes = require('./routes/instaroutes.js');
var db = require('./libs/db');
var express = require('express');
var app = express();

app.configure(function () {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({secret: 'instasensepassword', store: instalib.getSessionStore()}));
  app.use(express.static(__dirname + '/public'));
});

app.set('view options', {
  layout: false
});

app.get('/', instaroutes.getIndex);
app.post('/signup', instaroutes.signup);
app.post('/signin', instaroutes.signin);
app.get('/dashboard', instalib.ensureAuthenticated, instaroutes.dashboard);
app.get('/api/user/:username', instaroutes.getUser);
app.get('/api/feedbacks/:token', instalib.ensureAuthenticated, instaroutes.getFeedbacks);
app.post('/api/feedbacks/:token', instalib.ensureAuthenticated, instaroutes.addFeedback);

/*app.get('/api/trades', instaroutes.getTrades);
app.get('/api/user/:username', instaroutes.getUser);
app.post('/add-stock', instaroutes.addStock);
app.get('/portfolio', instalib.ensureAuthenticated, instaroutes.portfolio);
app.get('/analytics', instalib.ensureAuthenticated, instaroutes.analytics);
*/
db.open(function(){
  instalib.createSocket();
  app.listen(3000);
});
