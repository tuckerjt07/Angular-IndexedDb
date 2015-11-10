/*global angular*/
(function () {
    'use strict';
    /**
     * Connection Factory submodule
     *
     * @module ConnectionFactory.factory
     */
    angular.module('ConnectionFactory.factory', [])
    /**
     * ConnectionFactory is a factory used to open an instance of the IndexedDb database
     *
     * @namespace ConnectionManager.factory
     * @class ConnectionManager
     * @constructor
     * @param $window The native AngularJS $window object
     */
    .factory('ConnectionManager', ['$window', '$q',
            function ($window, $q) {
            var createDatabase;
            /**
             * Open the connection to the database
             * @private
             * @method openConnection
             * @param {Object} databaseObject The name and properties of the database
             * @param {Object} objectStoreObject The name and properties of the object store
             * @param {Object} indeces The name and properties of the indeces object
             * @param {Object} callback The function to call on success
             */
            createDatabase = function (databaseObject, objectStore, indeces, callback) {
                var request = $window.indexedDB.open(databaseObject.DbName, databaseObject.DbVersion);
                request.onerror = function (event) {
                    alert('Exited with error: ' + event.target.error.message);
                };
                request.onsuccess = function (event) {
                    databaseObject.Db = event.target.result;
                    callback(databaseObject, objectStore);
                };
                request.onupgradeneeded = function (event) {
                    var index;
                    databaseObject.Db = event.target.result;
                    //If autoIncrement is true we will use an incrementer, else use the passed key as Id
                    var objectStoreParams = objectStore.autoIncrement ? {
                        autoIncrement: true
                    } : {
                        keyPath: objectStore.keyPath
                    };
                    // Create an objectStore for this database
                    objectStore.createdObjectStore = databaseObject.Db.createObjectStore(objectStore.name, objectStoreParams);
                    //Add the indeces if they are passed
                    for (index in indeces) {
                        if (indeces.hasOwnProperty(index)) {
                            objectStore.createdObjectStore.createIndex(indeces[index].name, indeces[index].name, {
                                unique: indeces[index].unique
                            });
                        }
                    }
                    objectStore.createdObjectStore.oncomplete = function () {
                        if (callback) {
                            callback(databaseObject, objectStore);
                        }
                    };
                };
            };
            return {
                /**
                 * Open the connection to the database
                 * @public
                 * @method openConnection
                 * @param {Object} databaseObject The name and properties of the database
                 * @param {Object} objectStoreObject The name and properties of the object store
                 * @param {Object} indeces The name and properties of the indeces object
                 * @param {Object} callback The function to call on success
                 */
                openConnection: function (databaseObject, objectStore, indeces, callback) {
                    createDatabase(databaseObject, objectStore, indeces, callback);
                },
                /**
                 * Open the connection to the database using promise
                 * @public
                 * @method openConnection
                 * @param {Object} databaseObject The name and properties of the database
                 * @param {Object} objectStoreObject The name and properties of the object store
                 * @param {Object} indeces The name and properties of the indeces object
                 */
                openConnectionWithPromise: function (databaseObject, objectStore, indeces) {
                    var deferred, openConnectionWithPromise;
                    deferred = $q.defer();
                    openConnectionWithPromise = function (databaseObject, objectStore, indeces) {
                        var request = $window.indexedDB.open(databaseObject.DbName, databaseObject.DbVersion);
                        request.onerror = function (event) {
                            deferred.reject(event.target.error.message);
                        };
                        request.onupgradeneeded = function (event) {
                            var index;
                            databaseObject.Db = event.target.result;
                            //If autoIncrement is true we will use an incrementer, else use the passed key as Id
                            var objectStoreParams = objectStore.autoIncrement ? {
                                autoIncrement: true
                            } : {
                                keyPath: objectStore.keyPath
                            };
                            // Create an objectStore for this database
                            objectStore.createdObjectStore = databaseObject.Db.createObjectStore(objectStore.name, objectStoreParams);
                            //Add the indeces if they are passed
                            for (index in indeces) {
                                if (indeces.hasOwnProperty(index)) {
                                    objectStore.createdObjectStore.createIndex(indeces[index].name, indeces[index].name, {
                                        unique: indeces[index].unique
                                    });
                                }
                            }
                            objectStore.createdObjectStore.oncomplete = function () {
                                deferred.resolve(databaseObject.Db);
                            };
                        };
                        request.onsuccess = function (event) {
                            deferred.resolve(event.target.result);
                        };
                    };
                    openConnectionWithPromise(databaseObject, objectStore, indeces);
                    return deferred.promise;
                }
            };
        }]);
}());
