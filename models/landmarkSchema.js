"use strict"

var mongoose = require('mongoose');

var landmarkSchema = new mongoose.Schema({
  name: {type: String, required: true, unique: true},
  wikiLink: String,
  coords: Object,
  location: String,
  longitude: String,
  latitude: String,
  image: {type: String, default: "https://placeholdit.imgix.net/~text?txtsize=28&txt=No+Image+Available&w=150&h=150&txttrack=0"},
  yearOfSignificance: Number,
  blurb: {type: String, default: "No information available"},
  stories: [{type: String}],
  registryNumber: Number
})

module.exports = mongoose.model('Landmark', landmarkSchema)
