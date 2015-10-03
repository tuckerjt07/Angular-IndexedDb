/*global angular */
(function () {
    'use strict';
    angular.module('Helper.factory', [])
        .factory('HelperFactory', [function () {
            return {
                getFieldType: function (value) {
                    return typeof value;
                }
            };
        }]);
}());
