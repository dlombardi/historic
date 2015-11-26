'use strict';

var app = angular.module('landmarksApp');

app.factory('auth', function($window, $http, tokenStorageKey, $rootScope) {
  var auth = {};

  auth.saveToken = function(token) {
    $window.localStorage[tokenStorageKey] = token;
  };

  auth.getToken = function() {
    return $window.localStorage[tokenStorageKey];
  };

  auth.isLoggedIn = function(){
    var token = auth.getToken();
    if(token){
      var payload = JSON.parse($window.atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } else {
      return false;
    }
  };

  auth.register = function(user){
    return $http.post('/users/register', user)
  };

  auth.login = function(user){
    return $http.post('/users/login', user)
  };

  auth.logout = function(){
    $window.localStorage.removeItem(tokenStorageKey);
  };

  auth.getCurrentUserInfo = function() {
    $http.defaults.headers.common.Authorization = `Bearer ${auth.getToken()}`;
    $http.get('/users/me')
    .success( data => {
      $rootScope.user = data;
    })
    .error( err => {
      $rootScope.user = null;
    })

  };

  return auth;
});
