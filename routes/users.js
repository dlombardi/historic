"use strict"

var express = require('express');
var router = express.Router();
var User = require('../models/userSchema.js');
var auth = require('../config/auth.js');
let atob = require('atob')

/* GET users listing. */
router.post('/register', function(req, res, next) {
  if(!req.body.username || !req.body.password){
    return res.status(400).send('Username and password are required fields');
  }

  var user = new User();
  user.username= req.body.username;
  user.fullName= req.body.fullName;
  user.email= req.body.email;
  user.setPassword(req.body.password);

  user.save(function(err, data){
    if(err){
      res.status(401).send(err)
    } else {
      var jwt = user.generateJWT();
      res.send(jwt)
    }
  })
});

router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).send('Please fill out all fields');
  }

  User.findOne({username: req.body.username}, function(err, user){
    if(err){
      res.status(401).send(err)
    }else if(!user || !user.validPassword(req.body.password)){
      res.status(401).send('Invalid login credentials')
    }else{
      var jwt = user.generateJWT();
      res.send(jwt)
    }
  })
});

router.post('/favorites/:lid', auth, function (req, res){
  let jwt = req.headers.authorization.replace(/Bearer /, "")
  let userID = (JSON.parse(atob(jwt.split('.')[1])))._id
  var landmarkID = req.params.lid

  User.findById(userID, function (err,user){
    if(err){
      res.status(400).send(err)
    }else{
      if (user.favorites.indexOf(landmarkID) === -1){
        user.favorites.push(landmarkID);
        user.points += 15;
        user.save();
        res.send(user)
      }else{
        res.send(user)
      }
    }
  })
});

router.post('/visited/:lid', auth, function (req, res){
  let jwt = req.headers.authorization.replace(/Bearer /, "")
  let userID = (JSON.parse(atob(jwt.split('.')[1])))._id
  let landmarkID = req.params.lid

  User.findById(userID, function (err,user){
    if(err){
      res.status(400).send(err)
    }else{
      if (user.visited.indexOf(landmarkID) === -1){
        user.visited.push(landmarkID);
        user.points += 15
        user.save();
        res.send(user)
      }else{
        res.send(user)
      }
    }
  })
});

router.get('/me/', auth, (req, res) => {
  let jwt = req.headers.authorization.replace(/Bearer /, "")
  let userID = (JSON.parse(atob(jwt.split('.')[1])))._id

  User.findById(userID).populate('favorites').populate('visited').exec(function (err, data){
    err ? res.status(401).send(err) : res.send(data)
  })
});

router.get('/user/:id', auth, (req, res) => {
  User.findById(req.params.id, (err, user)=> {
    if (err) res.status(401).send(err);
    else res.send(user)
  })
});

module.exports = router;
