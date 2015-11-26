var app = angular.module('landmarksApp');

app.controller('ProfileCtrl', function($scope, auth, $ionicModal, landmark, $rootScope) {
  auth.getCurrentUserInfo();

  $ionicModal.fromTemplateUrl('html/landmark.html', {
    scope: $scope
  }).then(function(landmarkModal) {
    $scope.landmarkModal = landmarkModal;
  });

  $scope.closeLandmark = () => {
    $scope.landmarkModal.hide();
  }

  $scope.showLandmark = (displayLandmark) =>{
    $scope.displayLandmark = displayLandmark;
    $scope.hideVisitButton = true;
    $scope.hideFavoritesButton = landmark.testIndex($rootScope.user.favorites, displayLandmark._id);
    $scope.landmarkModal.show();
  }

  $scope.addToFavorites = (displayLandmark) => {
    landmark.addToFavorites(displayLandmark._id)
    .catch(err => {
      console.log(err);
    })
    .then(user => {
      auth.getCurrentUserInfo()
      swal({
        title: "Success!",
        text:  `${displayLandmark.name} has been added to your favorites!`,
        type: "success",
        timer: 1000,
        showConfirmButton: false
      });
      $scope.landmarkModal.hide();
    })
  }
});
