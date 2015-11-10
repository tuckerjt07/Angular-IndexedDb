/*global angular */
(function () {
    'use strict';
    angular.module('ObjectStore.value', [])
        .value('ObjectStore', {
            name: '',
            keyPath: '',
            autoIncrement: false,
            createdObjectStore: null
        });
}());
