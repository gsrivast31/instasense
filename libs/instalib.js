'use strict';

var db = require('./db');
var cookie = require('cookie');
var crypto = require('crypto');
var http = require('http');
var ObjectID = require('mongodb').ObjectID;
var express = require('express');
var connect = require('connect');
var MemoryStore = express.session.MemoryStore;

var sessionStore = new MemoryStore();
var io;

function encryptPassword(password) {
  var shaSum = crypto.createHash('sha256');
  shaSum.update(password);
  return shaSum.digest('hex');
}

function generateToken(username) {
  var shaSum = crypto.createHash('sha256');
  shaSum.update(username);
  return shaSum.digest('hex');
}

module.exports = {
    
  createSocket: function() {
    io = require('socket.io').listen(8080);
    io.configure(function () {
      io.set('authorization', function (handshakeData, callback) {
        if (handshakeData.headers.cookie) {
          handshakeData.cookie = cookie.parse(decodeURIComponent(handshakeData.headers.cookie));
          handshakeData.sessionID = connect.utils.parseSignedCookie(handshakeData.cookie['connect.sid'], 'instasensepassword');
          sessionStore.get(handshakeData.sessionID, function (err, session) {
            if (err || !session) {
              return callback(null, false);
            } 
            else {
              handshakeData.session = session;
              console.log('session data', session);
              return callback(null, true);
            } 
          });
        }
        else {
          return callback(null, false);
        }
      });
      
      io.sockets.on('connection', function (socket) {
        socket.on('addFeedback', function (data) {
          module.exports.getUserById(socket.handshake.session._id, function(err, user) {
            module.exports.createFeedback(user.token, data.feedback, function(err, numUpdates) {
              socket.emit('addSuccess', {});
            });
          });
        });
        
      });
    });
  },

  createUser: function(email, password, callback) {
    var user = {email:email, password:encryptPassword(password), token:generateToken(email)};
    db.insertOne('users', user, callback);
  },
    
  getUser: function(email, callback) {
    db.findOne('users', {email:email}, callback);
  },
  
  getUserById: function(id, callback) {
    db.findOne('users', {_id: new ObjectID(id)}, callback);
  },

  createFeedback: function(token, feedback, callback) {
	var feedback = {token:token, feedback:feedback};
	db.insertOne('feedbacks', feedback, callback);
  },
  
  getFeedbacks: function(token, limit, callback) {
	db.find('feedbacks', {token:token}, limit, callback);  
  },
  
  getFeedbackById: function(token, id, callback) {
	db.findOne('feedbacks', {token:token, _id: new ObjectID(id)}, callback);
  },
  
  authenticate: function(email, password, callback) {
    db.findOne('users', {email: email}, function(err, user) {
      console.log(err);
      
      if (user && (user.password === encryptPassword(password)))
        callback(err, user._id);
      else
        callback(err, null);
    });   
  },
  
  getSessionStore: function() {
    return sessionStore;
  },

  ensureAuthenticated: function (req, res, next) {
    if (req.session._id) {
      return next();
    }
    res.redirect('/');
  },
}
