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
                        var callback;
                        callback = function (databaseObject, objectStore) {
                            var item, transaction;
                            for (item in itemsToAdd) {
                                transaction = databaseObject.Db.transaction([objectStore.name], 'readwrite');
                                //transaction = setTransaction(databaseObject.Db.transaction, objectStore.name, 'readwrite');
                                if (itemsToAdd.hasOwnProperty(item)) {
                                    if (objectStore.createdObjectStore !== null) {
                                        objectStore.createdObjectStore.add(itemsToAdd[item]);
                                    } else {
                                        var store = transaction.objectStore(objectStore.name);
                                        store.add(itemsToAdd[item]);
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
                    }
                };
        }]);
}());
