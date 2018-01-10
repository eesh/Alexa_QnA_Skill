const express = require('express')
const app = express();
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')
const controllers = require('./controllers')

mongoose.connect('mongodb://localhost:27017/alexaPC')

app.use(cors());

app.use(bodyParser.urlencoded({ extended : false }))
app.use(bodyParser.json())

app.post('/attributes/user', controllers.addUserAttribute)
app.post('/attributes/alexa', controllers.addAlexaAttribute)

app.get('/attributes/user', controllers.getUserAttribute)
app.get('/attributes/alexa', controllers.getAlexaAttribute)

app.post('/user/login', controllers.login)
app.post('/user/register', controllers.register)
app.post('/alexa/login', controllers.alexaLogin)

app.listen(6456, () => {
  console.log("Server up and running on port 6456")
})
