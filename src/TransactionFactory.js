/*global angular */
/*jshint -W083 */
(function () {
    'use strict';
    angular.module('TransactionFactory.factory', [])
        .factory('TransactionFactory', ['ConnectionManager',
            function (ConnectionManager) {
                //                var setTransaction;
                //                setTransaction = function (databaseObjectTransaction, objectStoreName, transactionType) {
                //                    return databaseObjectTransaction([objectStoreName], transactionType);
                //                }
                return {
                    //itemsToAdd is an array of any type
                    insert: function (databaseObject, objectStoreObject, indecesObject, itemsToAdd) {
                        var callback, store;
                        callback = function (databaseObject, objectStore) {
                            var item, transaction;
                            for (item in itemsToAdd) {
                                if (itemsToAdd.hasOwnProperty(item)) {
                                    transaction = databaseObject.Db.transaction([objectStore.name], 'readwrite');
                                    if (itemsToAdd.hasOwnProperty(item)) {
                                        if (objectStore.createdObjectStore !== null) {
                                            transaction.add(itemsToAdd[item]);
                                        } else {
                                            store = transaction.objectStore(objectStore.name);
                                            store.add(itemsToAdd[item]);
                                        }
                                    }
                                }
                            }
                        };
                        ConnectionManager.openConnection(databaseObject, objectStoreObject, indecesObject, callback);
                    },
                    delete: function (databaseObject, objectStoreObject, indecesObject, keyToDelete) {
                        var callback;
                        callback = function (databaseObject, objectStore) {
                            databaseObject.Db.transaction([objectStore.name], 'readwrite')
                            .objectStore(objectStore.name)
                            .delete(keyToDelete);
                        };
                        ConnectionManager.openConnection(databaseObject, objectStoreObject, indecesObject, callback);
                    },
                    getByKey: function (databaseObject, objectStoreObject, indecesObject, keyValue, setValueCallback) {
                        var callback;
                        callback = function (databaseObject, objectStore) {
                            databaseObject.Db.transaction([objectStore.name])
                                .objectStore(objectStore.name)
                                .get(keyValue).onsuccess =
                                function (event) {
                                    if (setValueCallback) {
                                        setValueCallback(event.target.result);
                                    }
                            };
                        };
                        ConnectionManager.openConnection(databaseObject, objectStoreObject, indecesObject, callback);
                    },
                    updateDataByKey: function (databaseObject, objectStoreObject, indecesObject, updatedObject) {
                        var callback;
                        callback = function (databaseObject, objectStore) {
                            databaseObject.Db.transaction([objectStore.name], 'readwrite')
                                .objectStore(objectStore.name)
                                .put(updatedObject);
                        };
                        ConnectionManager.openConnection(databaseObject, objectStoreObject, indecesObject, callback);
                    },
                    selectAll: function (databaseObject, objectStoreObject, indecesObject, getAllCallback) {
                        var callback, results;
                        results = [];
                        callback = function (databaseObject, objectStore) {
                            databaseObject.Db.transaction([objectStore.name])
                            .objectStore(objectStore.name)
                            .openCursor().onsuccess = function (event) {
                                var cursor = event.target.result;
                                if (cursor) {
                                    results.push(cursor.value);
                                    cursor.continue();
                                } else {
                                    if (getAllCallback !== undefined) {
                                        getAllCallback(results);
                                    }
                                }
                            };
                        };
                        ConnectionManager.openConnection(databaseObject, objectStoreObject, indecesObject, callback);
                    }
                };
        }]);
}());
