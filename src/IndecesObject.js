/*global angular */
(function () {
    'use strict';
    angular.module('IndecesObject.value', [])
        .value('IndecesObject', [
            {
                name: '',
                params: {
                    unique: false
                }
            }
        ]);
}());
