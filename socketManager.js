var User = require('./models/User')
var io = null;
var clients = {};

function init(server) {
  io = require('socket.io')(server);

  io.on('connection', function(client){
    var clientID = client.id;
    clients[clientID] = client;
    console.log(`${clientID} connected`);

    client.on('message', function(message){
      if(message != null && message.command == "register") {
        saveClientID(client.id, message.access_code);
      }
    });

    client.on('disconnect', function() {
      var clientID = client.id;
      delete clients[clientID]
      console.log(`${clientID} disconnected`);
      removeClientID(clientID);
    });
  });
}

function runBlockSet(clientID, blockSet) {
  if(clients[clientID] == null) {
    console.log(`sendCommand: ${clientID} doesn't exist`);
    return false;
  }
  if(blockSet == null || blockSet < 1 || blockSet > 3) {
    console.log(`Invalid blockSet value: ${blockSet}`);
    return null;
  }

  clients[clientID].send({
    command: 'runcommand',
    arguments: {
      set: blockSet
    }
  });
  return true;
}

function saveClientID(clientID, access_code) {
  User.findOneAndUpdate({ 'access_code':access_code }, { $set:{ 'clientID':clientID }}, { 'new': true }, (err, user) => {
    if(err != null) {
      clients[clientID].send({ error: err.message });
      return;
    }
    if(user == null) {
      clients[clientID].send({ error: 'User object is null' });
      return;
    }
  });
}

function removeClientID(clientID) {
  User.findOneAndUpdate({ 'clientID':clientID }, { $set:{ 'clientID':null }}, { 'new': true }, (err, user) => {
    if(err) {
      console.log(`Failed to update clientID: ${err.message}`);
    }
    if(user == null) {
      console.log(`User object is null`);
    }
  });
}

module.exports = {
  instance: function() {
    return io;
  },
  initialize: init,
  runBlockSet: runBlockSet
}
