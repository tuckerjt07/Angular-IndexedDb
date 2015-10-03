/*global angular */
(function () {
    'use strict';
    angular.module('http.factory', [])
        .factory('HttpFactory', ['$http', function ($http) {
            return {
                get: function (address, callback, errorCallback) {
                    $http.get(address).success(function (data) {
                        if (callback !== undefined) {
                            callback(data);
                        }
                    }).error(function (error) {
                        if (errorCallback !== undefined) {
                            callback(error);
                        }
                    });
                }
            };
        }]);
}());
