"use strict"

require('mongoose').connect('mongodb://localhost/landmarks')
var Landmark = require('./models/landmarkSchema.js')

var fs = require('fs');
var obj = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
obj.landmarks.forEach(item => {
  item.coords = formatLandmarkCoordinates(item);
  Landmark.create(item, (err, landmark)=>{
    if(err) {
      console.log("err ", err);
    }else{
      console.log("created ", landmark);
    }
  })
})

function formatLandmarkCoordinates(location){
  if (!location.latitude){
    var formated = location.location.split(",");
    var coordinates = {lat: parseFloat(formated[0]), lng: parseFloat(formated[1])};
  } else {
    var latParts = location.latitude.split(/[^\d\w]+/);
    var lngParts = location.longitude.split(/[^\d\w]+/);
    var lat = ConvertDMSToDD(latParts[0], latParts[1], latParts[2], latParts[3]).toString();
    var lng = ConvertDMSToDD(lngParts[0], lngParts[1], lngParts[2], lngParts[3]).toString();

    var coordinates = {lat, lng};
  }
  return coordinates;
}

function ConvertDMSToDD(degrees, minutes, seconds, direction) {
  var dd = parseFloat(degrees) + parseFloat(minutes/60) + parseFloat(seconds/(60*60));

  if (direction == "S" || direction == "W") {
      dd = dd * -1;
  } // Don't do anything for N or E
  return dd;
}
