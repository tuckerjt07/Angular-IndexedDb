/*global angular*/
(function () {
    'use strict';
    angular.module('ConnectionFactory.factory', [])
        .factory('ConnectionManager', ['$window',
            function ($window) {
                var createDatabase = function (databaseObject, objectStore, indeces, callback) {
                    var request = $window.indexedDB.open(databaseObject.DbName, databaseObject.DbVersion);
                    request.onerror = function(event) {
                        alert('Exited with error: ' + event.target.error.message);
                    };
                    request.onsuccess = function(event) {
                        databaseObject.Db = event.target.result;
                        callback(databaseObject, objectStore);
                    };
                    request.onupgradeneeded = function(event) {
                        var index;
                        databaseObject.Db = event.target.result;
                        //If autoIncrement is true we will use an incrementer, else use the passed key as Id
                        var objectStoreParams = objectStore.autoIncrement ? {autoIncrement: true} : {keyPath: objectStore.keyPath};
                        // Create an objectStore for this database
                        objectStore.createdObjectStore = databaseObject.Db.createObjectStore(objectStore.name, objectStoreParams);
                        //Add the indeces if they are passed
                        for (index in indeces) {
                            if (indeces.hasOwnProperty(index)) {
                                objectStore.createdObjectStore.createIndex(indeces[index].name, indeces[index].name,
                                                                           {unique: indeces[index].unique});
                            }
                        }
                        objectStore.createdObjectStore.oncomplete = function (event) {
                            if (callback) {
                                callback(databaseObject, objectStore);
                            }
                        };
                    };
                };
                return {
                    openConnection: function (databaseObject, objectStore, indeces, callback) {
                        createDatabase(databaseObject, objectStore, indeces, callback);
                    }
                };
        }]);
}());
