/*global angular */
(function () {
    'use strict';
    angular.module('IndexedDb.Utils', ['ConnectionFactory.factory', 'DatabaseObject.value', 'ObjectStore.value', 'IndecesObject.value',
                                       'TransactionFactory.factory', 'TestController.Controller', 'Helper.factory', 'cache.factory',
                                      'http.factory']);
}());
