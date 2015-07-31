/*global angular */
(function () {
    'use strict';
    angular.module('DatabaseObject.value', [])
        .value('DatabaseObject', {
        DbName: '',
        DbVersion: '',
        Db: {}
    });
}());
