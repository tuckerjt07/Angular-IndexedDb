/*global angular */
(function () {
    'use strict';
    /**
     * Transaction Factory submodule
     *
     * @module IndexedDb.Utils
     * @param ConnectionFactory.factory The ConnectionFactory.factory module
     * @param DatabaseObject.value The DatabaseObject.value module
     * @param ObjectStore.value The ObjectStore.value module
     * @param IndecesObject.value The IndecesObject.value module
     * @param TransactionFactory.factory The TransactionFactory.factory module
     * @param TestController.Controller The TestController.Controller module
     * @param Helper.factory The Helper.factory module
     */
    angular.module('IndexedDb.Utils', ['ConnectionFactory.factory', 'DatabaseObject.value', 'ObjectStore.value', 'IndecesObject.value',
                                       'TransactionFactory.factory', 'Helper.factory']);
}());
