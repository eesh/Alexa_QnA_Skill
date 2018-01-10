const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
  "username": String,
  "passphrase": String,
  "authToken": {
    type: String,
    unique: true
  },
  "access_code": {
    type: Number,
    unique: true
  },
  "message": String
})

module.exports = mongoose.model('User', UserSchema)
