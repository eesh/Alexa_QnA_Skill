const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
  "username": String,
  "passphrase": String,
  "authToken": {
    type: String,
    sparse: true
  },
  "access_code": {
    type: Number,
    sparse: true
  },
  "message": String,
  "clientID": {
    type: String,
    sparse: true
  }
})

module.exports = mongoose.model('User', UserSchema)
