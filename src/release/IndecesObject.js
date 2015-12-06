/*global angular */
(function () {
    'use strict';
    /**
     * IndecesObject Value submodule
     *
     * @module IndecesObject.value
     */
    angular.module('IndecesObject.value', [])
        /**
         * IndecesObject is a value that holds the indeces's information and properties
         *
         * @namespace IndecesObject.value
         * @class IndecesObject
         * @constructor
         */
        .value('IndecesObject', [
            {
                /**
                 * The name of the indece
                 *
                 * @property name
                 * @type {String}
                 * @default ""
                 */
                name: '',
                /**
                 * The params of the index
                 *
                 * @property params
                 * @type {Object}
                 * @default { unique: false }
                 */
                params: {
                    unique: false
                },
                CreateObject: function (name, params) {
                    this.name = name;
                    this.params = params;
                }
            }
        ]);
}());
