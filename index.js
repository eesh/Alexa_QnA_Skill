const express = require('express')
const app = express();
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')
const controllers = require('./controllers')
const socketManager = require('./socketManager')
const config = require('./config')
const fs = require('fs')

const HTTP_PORT = 6456

mongoose.connect('mongodb://localhost:27017/alexaPC')

app.use(cors());

app.use(bodyParser.urlencoded({ extended : false }))
app.use(bodyParser.json())

app.post('/attributes/user', controllers.addUserAttribute)
app.get('/attributes/user', controllers.getUserAttribute)
app.post('/attributes/alexa', controllers.addAlexaAttribute)
app.get('/attributes/alexa', controllers.getAlexaAttribute)

app.post('/user/login', controllers.login)
app.post('/user/register', controllers.register)

app.post('/messages/user', controllers.addUserMessage)
app.get('/messages/user', controllers.getUserMessage)

app.post('/scratch/run', controllers.runScratchBlock)

app.post('/alexa/login', controllers.alexaLogin)

var options = {
  ca: fs.readFileSync(config.sslCA),
  key: fs.readFileSync(config.sslKeyPath),
  cert: fs.readFileSync(config.sslCertPath)
}

var server = require('https').createServer(options, app);
socketManager.initialize(server)
server.listen(HTTP_PORT, () => {
  console.log("Server up and running on port 6456")
})
