const mongoose = require('mongoose')

const UserAttributeSchema = mongoose.Schema({
  "uid": mongoose.Schema.ObjectId,
  "attribute": String,
  "value": String
})

module.exports = mongoose.model('UserAttribute', UserAttributeSchema)
