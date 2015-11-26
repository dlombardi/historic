var app = angular.module('landmarksApp');

app.factory('landmark', function($window, $http, auth){
  var landmark = {};

  landmark.getAll = function(){
    return $http.get('/landmarks')
  }

  landmark.getOne = function(id){
    return $http.get(`/landmarks/${id}`)
  }

  landmark.addToVisited = (id) => {
    $http.defaults.headers.common.Authorization = `Bearer ${auth.getToken()}`;
    return $http.post(`/users/visited/${id}`)
  }

  landmark.addToFavorites = (id) => {
    $http.defaults.headers.common.Authorization = `Bearer ${auth.getToken()}`;
    return $http.post(`/users/favorites/${id}`)
  }

  landmark.testIndex = (arr, id) =>{
    let index = false;
    arr.forEach(landmark => {
      if (landmark._id === id) index = true
    })
    return index
  }

  return landmark;
})
