const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
  "username": String,
  "passphrase": String,
  "authToken": {
    type: String,
    unique: true,
    sparse: true
  },
  "access_code": {
    type: Number,
    unique: true,
    sparse: true
  },
  "message": String,
  "clientID": {
    type: String,
    unique: true,
    sparse: true
  }
})

module.exports = mongoose.model('User', UserSchema)
