const mongoose = require('mongoose')

const AlexaAttributeSchema = mongoose.Schema({
  "attribute": String,
  "value": String
})

module.exports = mongoose.model('AlexaAttribute', AlexaAttributeSchema)
