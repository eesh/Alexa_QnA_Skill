const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
  "username": String,
  "passphrase": String,
  "authToken": {
    type: String,
    unique: true
  }
})

module.exports = mongoose.model('User', UserSchema)
