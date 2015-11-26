'use strict';

var app = angular.module('landmarksApp', ['ionic']);

app.constant('tokenStorageKey', 'my-token');

app.run(function ($ionicPlatform) {
  $ionicPlatform.ready(function () {

    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});

app.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider.state('app', {
    url: '/app',
    abstract: true,
    templateUrl: '../html/menu.html',
    controller: 'AppCtrl'
  }).state('app.profile', {
    url: '/profile',
    views: {
      'menuContent': {
        templateUrl: '../html/profile.html',
        controller: 'ProfileCtrl'
      }
    }
  }).state('app.landing', {
    url: '/landing',
    views: {
      'menuContent': {
        templateUrl: "../html/landing.html",
        controller: 'LandingCtrl'
      }
    }
  }).state('app.map', {
    url: '/map',
    views: {
      'menuContent': {
        templateUrl: "../html/map.html",
        controller: 'MapCtrl'
      }
    }
  });

  $urlRouterProvider.otherwise('/app/landing');
});
'use strict';

var app = angular.module('landmarksApp');

app.factory('auth', function ($window, $http, tokenStorageKey, $rootScope) {
  var auth = {};

  auth.saveToken = function (token) {
    $window.localStorage[tokenStorageKey] = token;
  };

  auth.getToken = function () {
    return $window.localStorage[tokenStorageKey];
  };

  auth.isLoggedIn = function () {
    var token = auth.getToken();
    if (token) {
      var payload = JSON.parse($window.atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } else {
      return false;
    }
  };

  auth.register = function (user) {
    return $http.post('/users/register', user);
  };

  auth.login = function (user) {
    return $http.post('/users/login', user);
  };

  auth.logout = function () {
    $window.localStorage.removeItem(tokenStorageKey);
  };

  auth.getCurrentUserInfo = function () {
    $http.defaults.headers.common.Authorization = 'Bearer ' + auth.getToken();
    $http.get('/users/me').success(function (data) {
      $rootScope.user = data;
    }).error(function (err) {
      $rootScope.user = null;
    });
  };

  return auth;
});
'use strict';

var app = angular.module('landmarksApp');

app.factory('landmark', function ($window, $http, auth) {
  var landmark = {};

  landmark.getAll = function () {
    return $http.get('/landmarks');
  };

  landmark.getOne = function (id) {
    return $http.get('/landmarks/' + id);
  };

  landmark.addToVisited = function (id) {
    $http.defaults.headers.common.Authorization = 'Bearer ' + auth.getToken();
    return $http.post('/users/visited/' + id);
  };

  landmark.addToFavorites = function (id) {
    $http.defaults.headers.common.Authorization = 'Bearer ' + auth.getToken();
    return $http.post('/users/favorites/' + id);
  };

  landmark.testIndex = function (arr, id) {
    var index = false;
    arr.forEach(function (landmark) {
      if (landmark._id === id) index = true;
    });
    return index;
  };

  return landmark;
});
'use strict';

var app = angular.module('landmarksApp');

app.controller('AppCtrl', ['$scope', '$timeout', '$state', 'auth', '$ionicModal', '$ionicHistory', '$rootScope', function ($scope, $timeout, $state, auth, $ionicModal, $ionicHistory, $rootScope) {

  $scope.Login = false;
  $scope.isLoggedIn = auth.isLoggedIn();

  ($scope.switchState = function () {
    $scope.Login = !$scope.Login;
    $scope.Login ? $scope.state = "Login" : $scope.state = "Create Account";
    $scope.Login ? $scope.stateSwitch = "Create Account" : $scope.stateSwitch = "Login";
    $scope.Login ? $scope.stateMessage = "Do you need an Account?" : $scope.stateMessage = "Go to login";
  })();

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('html/login.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function () {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function () {
    $scope.modal.show();
  };

  $scope.logout = function () {
    auth.logout();
    $rootScope.user = null;
    $scope.isLoggedIn = auth.isLoggedIn();
    $ionicHistory.nextViewOptions({
      historyRoot: true
    });
    $state.go("app.landing");
  };

  $scope.register = function (user) {
    if (!user || !user.username || !user.password || !user.email) {
      swal({
        title: "Error",
        text: "Email, username, and password are required fields",
        type: 'warning',
        timer: 1500,
        showConfirmButton: false
      });
    } else if (/(\w+\.)*\w+@(\w+\.)+\w+/.test(user.email)) {
      auth.register(user).success(function (data) {
        $scope.doLogin(user);
      }).error(function (err) {
        var error = undefined;
        if (err.errmsg.split(' ')[0] === "E11000") {
          error = "Username or email already exists!";
        }
        swal({
          title: "Error",
          text: error || err,
          type: 'warning',
          timer: 1500,
          showConfirmButton: false
        });
      });
    } else {
      swal({
        title: "Error",
        text: "Please enter a valid email",
        type: 'warning',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function (user) {
    auth.login(user).success(function (data) {
      auth.saveToken(data);
      auth.getCurrentUserInfo();
      swal({
        title: "Success!",
        text: "Successfully Authenticated",
        type: "success",
        timer: 1000,
        showConfirmButton: false
      });
      $scope.isLoggedIn = auth.isLoggedIn();

      $scope.closeLogin();

      //redirect to the profile page after login form is closed
      $ionicHistory.nextViewOptions({
        historyRoot: true
      });
      $state.go("app.profile");
      $scope.closeLogin();
    }).error(function (err) {
      swal({
        title: "Error",
        text: err,
        type: 'warning',
        timer: 1500,
        showConfirmButton: false
      });
    });
  };
}]);
'use strict';

var app = angular.module('landmarksApp');

app.controller('LandingCtrl', function ($scope, $stateParams) {});
'use strict';

var app = angular.module('landmarksApp');

app.controller('MapCtrl', function ($scope, $ionicLoading, $compile, landmark, $ionicModal, $rootScope, auth) {
  auth.getCurrentUserInfo();
  $scope.$on('$ionicView.enter', function () {
    initialize();
  });
  function initialize() {
    $scope.locations = [];
    var locationCoords = [];
    var markers = [];
    var inProcess = false;
    var isMiles = true;
    var landmarksMap;
    var myLatlng;
    var bounds;
    var center;
    var radius;
    var styles = [{
      featureType: 'road',
      elementType: 'labels',
      stylers: [{ saturation: -100 }, { invert_lightness: true }]
    }, {
      "featureType": "landscape",
      "stylers": [{ "weight": 0.1 }, { "saturation": 58 }, { "color": "#FBF8E7" }]
    }];

    function readjustView() {
      if (inProcess) {
        return;
      }
      inProcess = true;
      boundsAndCenter(landmarksMap);
      calcRadius(center, bounds);
      getLandmarks();
    }

    function haversineDistance(coords1, coords2, isMiles) {
      function toRad(x) {
        return x * Math.PI / 180;
      }

      var lat1 = parseFloat(coords1[0]);
      var lon1 = parseFloat(coords1[1]);

      var lat2 = parseFloat(coords2[0]);
      var lon2 = parseFloat(coords2[1]);

      var R = 6371; // km

      var x1 = lat2 - lat1;
      var dLat = toRad(x1);
      var x2 = lon2 - lon1;
      var dLon = toRad(x2);
      var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = R * c;

      if (isMiles) d /= 1.60934;

      return d;
    }

    function boundsAndCenter(landmarksMap) {
      var boundsObj = landmarksMap.getBounds();
      var sw = boundsObj.getSouthWest().toString();
      var ne = boundsObj.getNorthEast().toString();
      bounds = { NE: ne, SW: sw };
      center = landmarksMap.getCenter().toString();
    }

    function calcRadius(center, bounds) {
      var centerCoord = formatCoord(center);
      var neBounds = formatCoord(bounds.NE);
      radius = haversineDistance(centerCoord, neBounds, isMiles);
    }

    function formatCoord(coord) {
      return coord.split("").filter(function (el) {
        return el.match(/[\d|,|\.|\-]/g);
      }).join("").split(",");
    }

    function getLandmarks() {
      $scope.locations = [];
      var counter = 0;
      landmark.getAll().success(function (locations) {
        locations.forEach(function (location) {
          counter++;
          landmarkFromCenter(location);
          if (counter === locations.length) {
            collectMarkers();
            setTimeout(function () {
              popMarkers();
            }, 2000);
            inProcess = false;
          }
        });
      }).error(function (err) {
        console.log(err);
      });
    }

    function landmarkFromCenter(location) {
      var centerCoord = formatCoord(center);
      var landmarkCoords = [location.coords.lat, location.coords.lng];
      var distance = haversineDistance(landmarkCoords, centerCoord, isMiles);
      if (distance < radius) {
        $scope.locations.push(location);
      }
    }

    function collectMarkers() {
      var landmarks = $scope.locations;
      var marker;

      for (var i = 0; i < landmarks.length; i++) {
        marker = new google.maps.Marker({
          map: landmarksMap,
          position: new google.maps.LatLng(landmarks[i].coords.lat, landmarks[i].coords.lng),
          title: landmarks[i].name,
          landmark: landmarks[i]
        });
        marker.addListener('click', function () {
          toggleInfoWindow(this);
        });
        markers.push(marker);
      }
    }

    function toggleInfoWindow(marker) {
      $scope.showLandmark(marker.landmark);
    }

    function popMarkers() {
      for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(landmarksMap);
      }
    }

    async.series([function (callback) {
      $scope.loading = $ionicLoading.show({
        content: 'Getting current location...',
        showBackdrop: false
      });

      navigator.geolocation.getCurrentPosition(function (pos) {
        myLatlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        $scope.loading.hide();
        callback();
      }, function (error) {
        alert('Unable to get location: ' + error.message);
        callback(error);
      });
    }, function (callback) {
      var mapOptions = {
        center: myLatlng,
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: styles
      };

      landmarksMap = new google.maps.Map(document.getElementById("map"), mapOptions);

      landmarksMap.addListener('zoom_changed', function () {
        setTimeout(function () {
          readjustView();
        }, 500);
      });

      landmarksMap.addListener('idle', function () {
        setTimeout(function () {
          readjustView();
        }, 500);
      });

      google.maps.event.addListenerOnce(landmarksMap, 'idle', function () {
        setTimeout(function () {
          readjustView();
        }, 500);
      });

      callback();
    }], function (err) {
      if (err) {
        alert(err);
      }
      $scope.map = landmarksMap;
    });

    $scope.getCurrentLocation = function () {
      $scope.loading = $ionicLoading.show({
        content: 'Getting current location...',
        showBackdrop: false
      });

      navigator.geolocation.getCurrentPosition(function (position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        landmarksMap.setCenter(pos);
        $scope.loading.hide();
      }, function (error) {
        alert('Unable to get location: ' + error.messgage);
      });
      readjustView();
    };

    $ionicModal.fromTemplateUrl('html/landmark.html', {
      scope: $scope
    }).then(function (landmarkModal) {
      $scope.landmarkModal = landmarkModal;
    });

    $scope.closeLandmark = function () {
      $scope.landmarkModal.hide();
    };

    $scope.showLandmark = function (displayLandmark) {
      $scope.displayLandmark = displayLandmark;
      $scope.hideVisitButton = false;
      $scope.hideFavoritesButton = true;
      if ($rootScope.user) {
        $scope.hideVisitButton = landmark.testIndex($rootScope.user.visited, displayLandmark._id);
      }
      $scope.landmarkModal.show();
    };

    $scope.addToVisited = function (displayLandmark) {
      landmark.addToVisited(displayLandmark._id)['catch'](function (err) {
        console.log(err);
      }).then(function (user) {
        auth.getCurrentUserInfo();
        swal({
          title: "Success!",
          text: "You've visited " + displayLandmark.name,
          type: "success",
          timer: 2000,
          showConfirmButton: false
        });
        $scope.landmarkModal.hide();
      });
    };
  }
});
'use strict';

var app = angular.module('landmarksApp');

app.controller('ProfileCtrl', function ($scope, auth, $ionicModal, landmark, $rootScope) {
  auth.getCurrentUserInfo();

  $ionicModal.fromTemplateUrl('html/landmark.html', {
    scope: $scope
  }).then(function (landmarkModal) {
    $scope.landmarkModal = landmarkModal;
  });

  $scope.closeLandmark = function () {
    $scope.landmarkModal.hide();
  };

  $scope.showLandmark = function (displayLandmark) {
    $scope.displayLandmark = displayLandmark;
    $scope.hideVisitButton = true;
    $scope.hideFavoritesButton = landmark.testIndex($rootScope.user.favorites, displayLandmark._id);
    $scope.landmarkModal.show();
  };

  $scope.addToFavorites = function (displayLandmark) {
    landmark.addToFavorites(displayLandmark._id)['catch'](function (err) {
      console.log(err);
    }).then(function (user) {
      auth.getCurrentUserInfo();
      swal({
        title: "Success!",
        text: displayLandmark.name + ' has been added to your favorites!',
        type: "success",
        timer: 1000,
        showConfirmButton: false
      });
      $scope.landmarkModal.hide();
    });
  };
});