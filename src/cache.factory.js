/*global angular */
(function () {
    'use strict';
    angular.module('cache.factory', [])
        .factory('CacheFactory', ['TransactionFactory', 'HttpFactory', function (TransactionFactory, HttpFactory) {
            var consistencyCheck;
            //Check that the cached data matches the up to date data from the server
            consistencyCheck = function (databaseObject, objectStoreObject, indecesObject, data, apiAddress, originalCallback) {
                var httpCallback, httpErrorCallback;
                httpCallback = function (newData) {
                    if (newData !== data) {
                        TransactionFactory.insert(databaseObject, objectStoreObject, indecesObject, newData);
                        if (originalCallback !== null) {
                            originalCallback(newData);
                        }
                    }
                };
                httpErrorCallback = function (error) {
                    console.log(error);
                };
                HttpFactory.get(apiAddress, httpCallback, httpErrorCallback);
            };
            return {
                //Takes the passed in database and object store and selects all data from it
                //If the data does not exist then get it from the web service
                retrieveFromCache: function (databaseObject, objectStoreObject, indecesObject, callback, apiAddress) {
                    var retrieveFromCacheCallback;
                    retrieveFromCacheCallback = function (data) {
                        if (data.length > 0) {
                            if (callback !== undefined) {
                                callback(data);
                                consistencyCheck(databaseObject, objectStoreObject, indecesObject, data, apiAddress, callback);
                            }
                        } else {
                            var httpCallback, httpErrorCallback;
                            httpCallback = function (data) {
                                TransactionFactory.insert(databaseObject, objectStoreObject, indecesObject, data);
                                if (callback !== undefined) {
                                    callback(data);
                                }
                            };
                            httpErrorCallback = function (error) {
                                console.log(error);
                            };
                            HttpFactory.get(apiAddress, httpCallback, httpErrorCallback);
                        }
                    };
                    TransactionFactory.selectAll(databaseObject, objectStoreObject, indecesObject, retrieveFromCacheCallback);
                }
            };
        }]);
}());
