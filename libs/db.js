var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;

var envHost = process.env['MONGO_NODE_DRIVER_HOST'];
var envPort = process.env['MONGO_NODE_DRIVER_PORT'];

var host = envHost != null ? envHost: 'localhost';
var port = envPort != null ? envPort: Connection.DEFAULT_PORT;

var db = new Db('instasense' ,new Server(host, port, {}), {native_parser:false});

module.exports.open = open;
module.exports.insert = insert;
module.exports.insertOne = insertOne;
module.exports.find = find;
module.exports.findOne = findOne;
module.exports.push = push;
module.exports.updateById = updateById;

function open(callback) {
  db.open(callback);
}

function insert(name, items, callback) {
  db.collection(name).insert(items, callback);
}

function insertOne(name, item, callback) {
  module.exports.insert(name, item, function(err, items) {
    callback(err, items[0]);
  });
}

function find(name, query, limit, callback) {
  db.collection(name).find(query)
    .sort({_id: -1})
    .limit(limit)
    .toArray(callback);
}

function findOne(name, query, callback) {
  db.collection(name).findOne(query, function(err, item) {
    callback(err, item);
 });
}

function push(name, id, updateQuery, callback) {
  db.collection(name).update({_id: id}
    , {$push: updateQuery}, {safe:true}, callback);
}

function updateById(name, id, updateQuery, callback) {
  db.collection(name).update({_id: id}, {$set: updateQuery}
    , {safe:true}, callback);
}