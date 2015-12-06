/*global angular */
(function () {
    'use strict';
    /**
     * DatabaseObject Value submodule
     *
     * @module DatabaseObject.value
     */
    angular.module('DatabaseObject.value', [])
    /**
     * DatabaseObject is a value that holds the database's information and instance
     *
     * @namespace DatabaseObject.value
     * @class DatabaseObject
     * @constructor
     */
    .value('DatabaseObject', {
        /**
         * The name of the database to be opened or created.
         *
         * @property DbName
         * @type {String}
         * @default ""
         */
        DbName: '',
        /**
         * The version of the database to be opened or created. Passing a higher number than the previous version will trigger an update event on the databse.
         *
         * @property DbVersion
         * @type {Number}
         * @default ""
         */
        DbVersion: '',
        /**
         * The object that holds the instance of the databse
         *
         * @property Db
         * @type {Object}
         * @default {}
         */
        Db: {},
        CreateObject: function (dbName, dbVersion) {
            this.DbName = dbName;
            this.DbVersion = dbVersion;
        }
    });
}());
