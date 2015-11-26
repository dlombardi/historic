"use strict"

let express = require('express');
let router = express.Router();
let Landmark = require('../models/landmarkSchema.js')


router.get('/', (req, res, next) => {
  Landmark.find({}, (err, landmarks)=>{
    if(err) res.send(err)
    else res.send(landmarks)
  })
});

router.get('/one/:id', (req, res, next)=> {
  Landmark.findById(req.params.id, (err, landmark)=>{
    err ? res.status(401).send(err) : res.send(landmark)
  })
})

module.exports = router;
