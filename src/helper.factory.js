/*global angular */
(function () {
    'use strict';
    /**
     * Transaction Factory submodule
     *
     * @module Helper.factory
     */
    angular.module('Helper.factory', [])
    /**
     * HelperFactory is a factory used to execute repetitive functions used by the library
     *
     * @namespace Helper.factory
     * @class HelperFactory
     * @constructor
     */
    .factory('HelperFactory', [
        function () {
            return {
                /**
                 * Get the data type of the passed data
                 * @public
                 * @method getFieldType
                 * @param {Any} value The data to get the type of
                 * @return typeOfValue The data type of the passed value
                 */
                getFieldType: function (value) {
                    return typeof value;
                }
            };
        }]);
}());
