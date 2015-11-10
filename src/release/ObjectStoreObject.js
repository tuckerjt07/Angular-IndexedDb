/*global angular */
(function () {
    'use strict';
    /**
     * ObjectStore Value submodule
     *
     * @module ObjectStore.value
     */
    angular.module('ObjectStore.value', [])
    /**
     * ObjectStore is a value that holds the object store's information and properties
     *
     * @namespace ObjectStore.value
     * @class ObjectStore
     * @constructor
     */
    .value('ObjectStore', {
        /**
         * The name of the object store
         *
         * @property name
         * @type {String}
         * @default ""
         */
        name: '',
        /**
         * The key path of the object store
         *
         * @property key path
         * @type {String}
         * @default ""
         */
        keyPath: '',
        /**
         * Whether the object store will auto increment each new record. If set to true overrides the name property.
         *
         * @property autoIncrement
         * @type {Boolean}
         * @default false
         */
        autoIncrement: false,
        /**
         * Object that contains the instance of the object store
         *
         * @property createdObjectStore
         * @type {Object}
         * @default null
         */
        createdObjectStore: null
    });
}());
