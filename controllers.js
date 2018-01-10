const User = require('./models/User')
const AlexaAttribute = require('./models/AlexaAttribute')
const UserAttribute = require('./models/UserAttribute')
const Whirlpool = require('whirlpool')

const controllers = {

  getAlexaAttribute : function(req, res) {

    const attribute = req.query.attribute

    AlexaAttribute.findOne({ 'attribute' : attribute }, (err, doc) => {
      if(err) {
        res.json({ value: null })
        return
      }
      if(doc == null) {
        res.json({ value: null })
        return
      }

      res.json(doc)
      return
    })
  },

  addAlexaAttribute: function (req, res) {

    const attribute = req.body.attribute
    const value = req.body.value

    const alexaAttribute = new AlexaAttribute({ 'attribute' : attribute, 'value' : value })

    function addAttribute() {
      alexaAttribute.save(alexaAttribute, (err, doc) => {
        if(err) {
          res.json({ value: null })
          return
        }
        if(doc == null) {
          res.json({ value: null })
          return
        }

        res.json(doc)
        return;
      })
    }

    function updateAttribute() {
      AlexaAttribute.findOneAndUpdate({ 'attribute': attribute}, { $set: { 'value' : value }}, { 'new' : true}, (err, doc) => {
        if(err) {
          res.json({ value: null })
          return
        }
        if(doc == null) {
          res.json({ value: null })
          return
        }

        res.json(doc)
        return;
      })
    }

    AlexaAttribute.findOne({ 'attribute' : attribute }, (err, doc) => {
      if(err) {
        res.json({ value: null })
        return
      }
      if(doc != null) {
        console.log('found')
        updateAttribute();
        return
      }

      addAttribute();
      return
    })
  },

  addUserAttribute : function (req, res) {

    const authToken = req.headers.authtoken
    const attribute = req.body.attribute
    const value = req.body.value

    const userAttribute = new UserAttribute({ 'attribute' : attribute, 'value' : value })

    function addAttribute(userId) {
      UserAttribute.findOneAndUpdate({'uid' : userId, 'attribute' : attribute}, { $set: { 'value' : value }}, { 'new' : true, 'upsert' : true}, (err, doc) => {
        if(err != null || doc != null) {
          if(err) {
            console.log(err.message)
          }

          if(doc != null) {
            res.json(doc);
            return;
          }
        }
        res.json(doc);
        return
      })
    }

    User.findOne({ 'authToken' : authToken }, function (err, doc) {
      if(err != null || doc == null) {
        res.json({value: null, error: 'No such user'})
        return
      }

      userAttribute.uid = doc.id;
      addAttribute(doc.id)
    })
  },

  addUserMessage: function (req, res) {

    const authToken = req.headers.authtoken
    const message = req.body.message

    User.findOneAndUpdate({ 'authToken' : authToken }, { $set : { "message":message}}, { 'new' : true }, function (err, doc) {
      if(err != null || doc == null) {
        res.json({value: null, error: 'No such user'})
        return
      }
      res.json(doc)
    })
  },

  getUserAttribute : function (req, res) {

    const authToken = req.headers.authtoken
    const attribute = req.query.attribute

    function getAttribute(userId) {
      UserAttribute.findOne({'uid' : userId, 'attribute' : attribute}, (err, doc) => {
        if(err != null || doc == null) {
          res.json({value: null, error: 'No such attribute'})
          return
        }
        res.json(doc)
        return
      })
    }

    User.findOne({ 'authToken' : authToken }, function (err, doc) {
      if(err != null || doc == null) {
        res.json({value: null, error: 'No such user'})
        return
      }

      getAttribute(doc.id)
    })
  },

  getUserMessage : function (req, res) {

    const authToken = req.headers.authtoken

    User.findOne({ 'authToken' : authToken }, function (err, doc) {
      if(err != null || doc == null) {
        res.json({value: null, error: 'No such user'})
        return
      }
      res.json({value: doc.message});
    })
  },

  login : function (req, res) {
    const username = req.body.username
    const passphrase = Whirlpool(req.body.passphrase)

    function setAuthToken(userId) {
      const authToken = generateUUID();
      const access_code = generateUAC(10000,99999);
      User.findOneAndUpdate({_id : userId} , { $set: { 'authToken' : authToken, 'access_code': access_code } }, { new : true }, (err, doc) => {
        console.log(err, doc)
        if(err != null || doc == null) {
          res.json({value: null, error: 'Try again'})
          return
        }

        res.json({authToken : doc.authToken, access_code: doc.access_code})
        return
      })
    }

    User.findOne({ 'username' : username, 'passphrase' : passphrase }, (err, doc) => {

      if(err != null || doc == null) {
        console.log({value: null, error: 'No such user'})
        res.json({value: null, error: 'No such user'})
        return
      }

      if(doc.authToken != null) {
        res.json({authToken : doc.authToken, access_code: doc.access_code })
        return
      }

      setAuthToken(doc.id)
    })
  },


  register : function (req, res) {

    const username = req.body.username
    const passphrase = Whirlpool(req.body.passphrase)

    function onSave(err, doc) {
      console.log('onSave')
      if(err != null ) {
        res.json({value: null, error: err.message })
        return
      }

      if(doc == null) {
        res.json({value : null, error: 'User couldn\'t be registered'})
        return
      }

      res.json(doc)
      return
    }

    console.log(username, passphrase)
    User.findOne({ 'username' : username, 'passphrase' : passphrase }, (err, doc) => {
      if(err != null ) {
        res.json({value: null, error: err.message })
        return
      }

      if(doc != null) {
        res.json({value : null, error: 'User already exists'})
        return
      }

      const user = new User({ 'username': username, 'passphrase' : passphrase })
      user.save(onSave)
    })
  },

  alexaLogin : function (req, res) {

    const access_code = req.body.access_code

    User.findOne({ 'access_code' : access_code }, (err, doc) => {

      if(err != null || doc == null) {
        console.log({value: null, error: 'No such user'})
        res.json({value: null, error: 'No such user'})
        return
      }

      if(doc.authToken != null) {
        console.log('authToken', doc.authToken)
        res.json({authToken : doc.authToken})
        return
      }
    })
  },

  runScratchBlock: function (req, res) {

    const authtoken = req.body.authtoken
    const blockset = req.body.blockSet

    function onUserFound(user) {
      if(user.clientID == null) {
        res.json({success: false, message: 'Scratch not connected'});
        return;
      }
      var socketManager = require('./socketManager').instance();
      var result = socketManager.runBlockSet(user.clientID, blockset);
      if(result == null) {
        res.json({success: false, message: 'Invalid blockset'});
        return;
      }
      if(result == false) {
        res.json({success: false, message: 'Scratch not connected'});
        return;
      }
      res.json({success: true})
    }

    User.findOne({ 'authToken' : authtoken }, (err, doc) => {

      if(err != null || doc == null) {
        console.log({value: null, error: 'No such user'})
        res.json({value: null, error: 'No such user'})
        return
      }
      onUserFound(doc);
    })
  }
}

function generateUUID () { // Public Domain/MIT
  var d = new Date().getTime();
  if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
      d += performance.now(); //use high-precision timer if available
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  })
};

function generateUAC (min, max) { // Public Domain/MIT
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports = controllers
