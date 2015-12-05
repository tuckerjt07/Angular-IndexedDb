/*global angular */
/*jshint -W083 */
(function () {
    'use strict';
    /**
     * Transaction Factory submodule
     *
     * @module TransactionFactory.factory
     */
    angular.module('TransactionFactory.factory', [])
    /**
     * TransactionFactory is a factory that handles the transactional interactions with the IndexedDb database
     *
     * @namespace TransactionFactory.factory
     * @class TransactionFactory
     * @constructor
     * @param ConnectionManager The ConnectionManager factory that handles connecting to the IndexedDb instance
     */
    .factory('TransactionFactory', ['$q', 'ConnectionManager',
            function ($q, ConnectionManager) {
                var clearDataFromObjectStore, checkIfObjectStoreExists;
            clearDataFromObjectStore = function (databaseObject, objectStoreName) {
                databaseObject.Db.transaction([objectStoreName])
                    .objectStore(objectStoreName).clear();
            };
            checkIfObjectStoreExists = function (objectStoreName) {
                var objectStoreNames, i, objectStoreFound;
                objectStoreFound = false;
                objectStoreNames = ConnectionManager.getObjectStoreNames();
                for (i = 0; i < objectStoreNames; i++) {
                    if (objectStoreName === objectStoreNames[1]) {
                        objectStoreFound = true;
                        break;
                    }
                }
                return objectStoreFound;
            };
            return {
                /**
                 * Insert a record or collection of records into the specified object store
                 * @public
                 * @method insert
                 * @param {Object} databaseObject The name and properties of the database
                 * @param {Object} objectStoreObject The name and properties of the object store
                 * @param {Object} indecesObject The name and properties of the indeces object
                 * @param {Object} itemsToAdd An array of any type of the records to add
                 */
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
                /**
                 * Insert a record or collection of records into the specified object store
                 * @public
                 * @method insertWithPromise
                 * @param {Object} databaseObject The name and properties of the database
                 * @param {Object} objectStoreObject The name and properties of the object store
                 * @param {Object} indecesObject The name and properties of the indeces object
                 * @param {Object} itemsToAdd An array of any type of the records to add
                 *
                 * @return {Boolean} $q.promise Return true if function completes successfully
                 */
                insertWithPromise: function (databaseObject, objectStoreObject, indecesObject, itemsToAdd) {
                    var deferred, store;
                    deferred = $q.defer();
                    ConnectionManager.getDatabaseVersion(databaseObject).then(function (versionNumber) {
                        if (!checkIfObjectStoreExists(objectStoreObject.name)) {
                            databaseObject.version = versionNumber + 1;
                        } else {
                            databaseObject.version = versionNumber;
                        }
                        ConnectionManager.openConnectionWithPromise(databaseObject, objectStoreObject, indecesObject)
                            .then(function (data) {
                            var item, transaction;
                            for (item in itemsToAdd) {
                                if (itemsToAdd.hasOwnProperty(item)) {
                                    transaction = data.transaction([objectStoreObject.name], 'readwrite');
                                    if (itemsToAdd.hasOwnProperty(item)) {
                                        if (objectStoreObject.createdObjectStore !== null && objectStoreObject.createdObjectStore !== null) {
                                            transaction = data.transaction([objectStoreObject.name], 'readwrite');
                                        }
                                        store = transaction.objectStore(objectStoreObject.name);
                                        store.add(itemsToAdd[item]);
                                    }
                                }
                                deferred.resolve(true);
                            }
                        });
                    });
                    return deferred.promise;
                },
                /**
                 * Delete the specified record from the database
                 * @public
                 * @method delete
                 * @param {Object} databaseObject The name and properties of the database
                 * @param {Object} objectStoreObject The name and properties of the object store
                 * @param {Object} indecesObject The name and properties of the indeces object
                 * @param {String or Number} keyToDelete The key value of the record to delete
                 */
                delete: function (databaseObject, objectStoreObject, indecesObject, keyToDelete) {
                    var callback;
                    callback = function (databaseObject, objectStore) {
                        databaseObject.Db.transaction([objectStore.name], 'readwrite')
                            .objectStore(objectStore.name)
                            .delete(keyToDelete);
                    };
                    ConnectionManager.openConnection(databaseObject, objectStoreObject, indecesObject, callback);
                },
                /**
                 * Delete the specified record from the database
                 * @public
                 * @method deleteWithPromise
                 * @param {Object} databaseObject The name and properties of the database
                 * @param {Object} objectStoreObject The name and properties of the object store
                 * @param {Object} indecesObject The name and properties of the indeces object
                 * @param {String or Number} keyToDelete The key value of the record to delete
                 *
                 * @return {Boolean} $q.promise Return true if function completes successfully
                 */
                deleteWithPromise: function (databaseObject, objectStoreObject, indecesObject, keyToDelete) {
                    var deferred;
                    deferred = $q.defer();
                    ConnectionManager.openConnectionWithPromise(databaseObject, objectStoreObject, indecesObject).then(function (data) {
                        data.transaction([objectStoreObject.name], 'readwrite')
                            .objectStore(objectStoreObject.name)
                            .delete(keyToDelete);
                        deferred.resolve(true);
                    });
                    return deferred.promise;
                },
                /**
                 * Get a record from the database using the records key value
                 * @public
                 * @method getByKey
                 * @param {Object} databaseObject The name and properties of the database
                 * @param {Object} objectStoreObject The name and properties of the object store
                 * @param {Object} indecesObject The name and properties of the indeces object
                 * @param {String or Number} keyValue The key value of the record to retrieve
                 * @param {Object} setValueCallback the callback function to fire on success
                 */
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
                /**
                 * Get a record from the database using the records key value
                 * @public
                 * @method getByKey
                 * @param {Object} databaseObject The name and properties of the database
                 * @param {Object} objectStoreObject The name and properties of the object store
                 * @param {Object} indecesObject The name and properties of the indeces object
                 * @param {String or Number} keyValue The key value of the record to retrieve
                 *
                 * @return {Object} $q.promise the returned row object
                 */
                getByKeyWithPromise: function (databaseObject, objectStoreObject, indecesObject, keyValue) {
                    var deferred;
                    deferred = $q.defer();
                    ConnectionManager.openConnectionWithPromise(databaseObject, objectStoreObject, indecesObject).then(function (data) {
                        data.transaction([objectStoreObject.name])
                            .objectStore(objectStoreObject.name)
                            .get(keyValue).onsuccess =
                            function (event) {
                            deferred.resolve(event.target.result);
                        };
                    });
                    return deferred.promise;
                },
                /**
                 * Get a record from the database using the records index and index value. Not as performant as getByKey.
                 * @public
                 * @method getByIndex
                 * @param {Object} databaseObject The name and properties of the database
                 * @param {Object} objectStoreObject The name and properties of the object store
                 * @param {Object} indecesObject The name and properties of the indeces object
                 * @param {String or Number} indexValue The index value of the record to retrieve
                 * @param {String} indexName The name of the index column to search on
                 * @param {Object} getByIndexCallback the callback function to fire on success
                 */
                getByIndex: function (databaseObject, objectStoreObject, indecesObject, indexValue, indexName, getByIndexCallback) {
                    var callback;
                    callback = function (databaseObject, objectStore) {
                        databaseObject.Db.transaction([objectStore.name])
                            .objectStore(objectStore.name)
                            .index(indexName)
                            .get(indexValue).onsuccess =
                            function (event) {
                                if (getByIndexCallback !== undefined) {
                                    getByIndexCallback(event.target.result);
                                }
                        };
                    };
                    ConnectionManager.openConnection(databaseObject, objectStoreObject, indecesObject, callback);
                },
                /**
                 * Get a record from the database using the records index and index value. Not as performant as getByKey.
                 * @public
                 * @method getByIndexWithPromise
                 * @param {Object} databaseObject The name and properties of the database
                 * @param {Object} objectStoreObject The name and properties of the object store
                 * @param {Object} indecesObject The name and properties of the indeces object
                 * @param {String or Number} indexValue The index value of the record to retrieve
                 * @param {String} indexName The name of the index column to search on
                 *
                 * @return {Object} $q.promise The returned row from the database
                 */
                getByIndexWithPromise: function (databaseObject, objectStoreObject, indecesObject, indexValue, indexName) {
                    var deferred;
                    deferred = $q.defer();
                    ConnectionManager.openConnectionWithPromise(databaseObject, objectStoreObject, indecesObject)
                        .then(function (data) {
                        data.transaction([objectStoreObject.name])
                            .objectStore(objectStoreObject.name)
                            .index(indexName)
                            .get(indexValue).onsuccess =function (event) {
                                deferred.resolve(event.target.result);
                            };
                    });
                    return deferred.promise;
                },
                /**
                 * Get a record from the database using the records value when an indexed column is not present. Not as performant as getByIndex.
                 * @public
                 * @method getByValue
                 * @param {Object} databaseObject The name and properties of the database
                 * @param {Object} objectStoreObject The name and properties of the object store
                 * @param {Object} indecesObject The name and properties of the indeces object
                 * @param {String or Number} value The value of the record to retrieve
                 * @param {String} columnName The name of the column to search on
                 * @param {Object} getByValueCallback the callback function to fire on success
                 */
                getByValue: function (databaseObject, objectStoreObject, indecesObject, value, columnName, getByValueCallback) {
                    var callback, results;
                    results = [];
                    callback = function (databaseObject, objectStore) {
                        databaseObject.Db.transaction([objectStore.name])
                            .objectStore(objectStore.name)
                            .openCursor().onsuccess = function (event) {
                                var cursor = event.target.result;
                                if (cursor) {
                                    if (cursor.value[columnName].toString().indexOf(value) > -1) {
                                        results.push(cursor.value);
                                        cursor.continue();
                                    } else {
                                        cursor.continue();
                                    }
                                } else {
                                    if (getByValueCallback !== undefined) {
                                        getByValueCallback(results);
                                    }
                                }
                        };
                    };
                    ConnectionManager.openConnection(databaseObject, objectStoreObject, indecesObject, callback);
                },
                /**
                 * Get a record from the database using the records value when an indexed column is not present. Not as performant as getByIndex.
                 * @public
                 * @method getByValue
                 * @param {Object} databaseObject The name and properties of the database
                 * @param {Object} objectStoreObject The name and properties of the object store
                 * @param {Object} indecesObject The name and properties of the indeces object
                 * @param {String or Number} value The value of the record to retrieve
                 * @param {String} columnName The name of the column to search on
                 *
                 * @return {Object} $q.promise The returned row object
                 */
                getByValueWithPromise: function (databaseObject, objectStoreObject, indecesObject, value, columnName) {
                    var deferred, results;
                    deferred = $q.defer();
                    results = [];
                    ConnectionManager.openConnectionWithPromise(databaseObject, objectStoreObject, indecesObject).then(function (data) {
                        data.transaction([objectStoreObject.name])
                            .objectStore(objectStoreObject.name)
                            .openCursor().onsuccess = function (event) {
                            var cursor = event.target.result;
                            if (cursor) {
                                if (cursor.value[columnName].toString().indexOf(value) > -1) {
                                    results.push(cursor.value);
                                    cursor.continue();
                                } else {
                                    cursor.continue();
                                }
                            } else {
                                deferred.resolve(results);
                            }
                        };
                    });
                    return deferred.promise;
                },
                /**
                 * Update a record using its key value. If the object is not present it will be inserted as a new record.
                 * @public
                 * @method updateDataByKey
                 * @param {Object} databaseObject The name and properties of the database
                 * @param {Object} objectStoreObject The name and properties of the object store
                 * @param {Object} indecesObject The name and properties of the indeces object
                 * @param {Object} updatedObject The updated object and its values
                 */
                updateDataByKey: function (databaseObject, objectStoreObject, indecesObject, updatedObject) {
                    var callback;
                    callback = function (databaseObject, objectStore) {
                        databaseObject.Db.transaction([objectStore.name], 'readwrite')
                            .objectStore(objectStore.name)
                            .put(updatedObject);
                    };
                    ConnectionManager.openConnection(databaseObject, objectStoreObject, indecesObject, callback);
                },
                /**
                 * Update a record using its key value. If the object is not present it will be inserted as a new record.
                 * @public
                 * @method updateDataByKey
                 * @param {Object} databaseObject The name and properties of the database
                 * @param {Object} objectStoreObject The name and properties of the object store
                 * @param {Object} indecesObject The name and properties of the indeces object
                 * @param {Object} updatedObject The updated object and its values
                 *
                 * @param {Boolean} $q.promise Returns true if succssful
                 */
                updateDataByKeyWithPromise: function (databaseObject, objectStoreObject, indecesObject, updatedObject) {
                    var deferred;
                    deferred = $q.defer();
                    ConnectionManager.openConnection(databaseObject, objectStoreObject, indecesObject).then(function (data) {
                        data.transaction([objectStoreObject.name], 'readwrite')
                            .objectStore(objectStoreObject.name)
                            .put(updatedObject);
                        deferred.resolve();
                    });
                    return deferred.promise;
                },
                /**
                 * Get all reecords in the object store.
                 * @public
                 * @method selectAll
                 * @param {Object} databaseObject The name and properties of the database
                 * @param {Object} objectStoreObject The name and properties of the object store
                 * @param {Object} indecesObject The name and properties of the indeces object
                 * @param {Object} getAllCallback The callback method fired on successful retrieval
                 */
                selectAll: function (databaseObject, objectStoreObject, indecesObject, getAllCallback) {
                    var results;
                    results = [];
                    ConnectionManager.openConnectionWithPromise(databaseObject, objectStoreObject, indecesObject).then(function (data) {
                        data.transaction([objectStoreObject.name])
                            .objectStore(objectStoreObject.name)
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
                    });
                },
                /**
                 * Get all reecords in the object store.
                 * @public
                 * @method selectAllWithPromise
                 * @param {Object} databaseObject The name and properties of the database
                 * @param {Object} objectStoreObject The name and properties of the object store
                 * @param {Object} indecesObject The name and properties of the indeces object
                 *
                 * @return {Object} IndexedDbObject The object that holds the instance of the current IndexedDb
                 */
                selectAllWithPromise: function (databaseObject, objectStoreObject, indecesObject) {
                    var deferred, results;
                    deferred = $q.defer();
                    results = [];
                    ConnectionManager.openConnectionWithPromise(databaseObject, objectStoreObject, indecesObject).then(function (data) {
                        data.transaction([objectStoreObject.name])
                            .objectStore(objectStoreObject.name)
                            .openCursor().onsuccess = function (event) {
                            var cursor = event.target.result;
                            if (cursor) {
                                results.push(cursor.value);
                                cursor.continue();
                            } else {
                                deferred.resolve(results);
                            }
                        };
                    });
                    return deferred.promise;
                },
                /**
                 * Get a record from the database using start and stop 0 indexed position. Useful for pagination.
                 * @public
                 * @method selectByPosition
                 * @param {Object} databaseObject The name and properties of the database
                 * @param {Object} objectStoreObject The name and properties of the object store
                 * @param {Object} indecesObject The name and properties of the indeces object
                 * @param {Number} start The 0 indexed start value
                 * @param {Number} stop The 0 indexed stop value
                 * @param {Object} getByPositionCallback the callback function to fire on success
                 */
                selectByPosition: function (databaseObject, objectStoreObject, indecesObject, start, stop, getByPositionCallback) {
                    var callback, cursorPosition, results;
                    cursorPosition = 0;
                    results = [];
                    callback = function (databaseObject, objectStore) {
                        databaseObject.Db.transaction([objectStore.name])
                            .objectStore(objectStore.name)
                            .openCursor().onsuccess = function (event) {
                                var cursor = event.target.result;
                                if (cursor) {
                                    if (cursorPosition < start) {
                                        cursorPosition++;
                                        cursor.advance(start);
                                    } else if (cursorPosition >= start && cursorPosition <= stop) {
                                        results.push(cursor.value);
                                        cursorPosition++;
                                        cursor.continue();
                                    } else {
                                        cursor.continue();
                                    }
                                } else {
                                    if (getByPositionCallback !== undefined) {
                                        getByPositionCallback(results);
                                    }
                                }
                        };
                    };
                    ConnectionManager.openConnection(databaseObject, objectStoreObject, indecesObject, callback);
                },
                /**
                 * Get a record from the database using start and stop 0 indexed position. Useful for pagination.
                 * @public
                 * @method selectByPositionWithPromise
                 * @param {Object} databaseObject The name and properties of the database
                 * @param {Object} objectStoreObject The name and properties of the object store
                 * @param {Object} indecesObject The name and properties of the indeces object
                 * @param {Number} start The 0 indexed start value
                 * @param {Number} stop The 0 indexed stop value
                 *
                 * @return {Object} $q.promise Return the selected row
                 */
                selectByPositionWithPromise: function (databaseObject, objectStoreObject, indecesObject, start, stop) {
                    var deferred, cursorPosition, results;
                    deferred = $q.defer();
                    cursorPosition = 0;
                    results = [];
                    ConnectionManager.openConnectionWithPromise(databaseObject, objectStoreObject, indecesObject).then(function (data) {
                        data.transaction([objectStoreObject.name])
                            .objectStore(objectStoreObject.name)
                            .openCursor().onsuccess = function (event) {
                            var cursor = event.target.result;
                            if (cursor) {
                                if (cursorPosition < start) {
                                    cursorPosition++;
                                    cursor.advance(start);
                                } else if (cursorPosition >= start && cursorPosition <= stop) {
                                    results.push(cursor.value);
                                    cursorPosition++;
                                    cursor.continue();
                                } else {
                                    cursor.continue();
                                }
                            } else {
                                deferred.resolve(results);
                            }
                        };
                    });
                    return deferred.promise;
                },
                /**
                 * Get a record from the database by a specified value. Will perform pattern matching on any occurence of a string or number in any column in the object store.
                 * @public
                 * @method freeTextSearch
                 * @param {Object} databaseObject The name and properties of the database
                 * @param {Object} objectStoreObject The name and properties of the object store
                 * @param {Object} indecesObject The name and properties of the indeces object
                 * @param {String or Number} start The value to search for.
                 * @param {Object} freeTextSearchCallback the callback function to fire on success
                 */
                freeTextSearch: function (databaseObject, objectStoreObject, indecesObject, value, freeTextSearchCallback) {
                    var callback, results;
                    results = [];
                    callback = function (databaseObject, objectStore) {
                        databaseObject.Db.transaction([objectStore.name])
                            .objectStore(objectStore.name)
                            .openCursor().onsuccess = function (event) {
                                var cursor = event.target.result;
                                if (cursor) {
                                    var property;
                                    for (property in cursor.value) {
                                        if (cursor.value.hasOwnProperty(property)) {
                                            if (cursor.value[property].toString().indexOf(value) > -1) {
                                                results.push(cursor.value);
                                                break;
                                            }
                                        }
                                    }
                                    cursor.continue();
                                } else {
                                    if (freeTextSearchCallback !== undefined) {
                                        freeTextSearchCallback(results);
                                    }
                                }
                        };
                    };
                    ConnectionManager.openConnection(databaseObject, objectStoreObject, indecesObject, callback);
                },
                /**
                 * Get a record from the database by a specified value. Will perform pattern matching on any occurence of a string or number in any column in the object store.
                 * @public
                 * @method freeTextSearchWithPromise
                 * @param {Object} databaseObject The name and properties of the database
                 * @param {Object} objectStoreObject The name and properties of the object store
                 * @param {Object} indecesObject The name and properties of the indeces object
                 * @param {String or Number} start The value to search for.
                 * @param {Object} freeTextSearchCallback the callback function to fire on success
                 */
                freeTextSearchWithPromise: function (databaseObject, objectStoreObject, indecesObject, value) {
                    var deferred, results;
                    deferred = $q.defer();
                    results = [];
                    ConnectionManager.openConnectionWithPromise(databaseObject, objectStoreObject, indecesObject).then(function (data) {
                        data.transaction([objectStoreObject.name])
                            .objectStore(objectStoreObject.name)
                            .openCursor().onsuccess = function (event) {
                            var cursor = event.target.result;
                            if (cursor) {
                                var property;
                                for (property in cursor.value) {
                                    if (cursor.value.hasOwnProperty(property)) {
                                        if (cursor.value[property].toString().indexOf(value) > -1) {
                                            results.push(cursor.value);
                                            break;
                                        }
                                    }
                                }
                                cursor.continue();
                            } else {
                                deferred.resolve(results);
                            }
                        };
                    });
                    return deferred.promise;
                },
                /**
                 * Get the name of the object store's key path.
                 * @public
                 * @method getKeyPath
                 * @param {Object} databaseObject The name and properties of the database
                 * @param {Object} objectStoreObject The name and properties of the object store
                 * @param {Object} indecesObject The name and properties of the indeces object
                 * @param {Object} getKeyPathCallback the callback function to fire on success
                 */
                getKeyPath: function (databaseObject, objectStoreObject, indecesObject, getKeyPathCallback) {
                    var callback;
                    callback = function (databaseObject, objectStore) {
                        var keyPath = databaseObject.Db.transaction([objectStore.name])
                            .objectStore(objectStore.name).keyPath;
                        if (getKeyPathCallback !== undefined) {
                            getKeyPathCallback(keyPath);
                        }
                    };
                    ConnectionManager.openConnection(databaseObject, objectStoreObject, indecesObject, callback);
                },
                /**
                 * Get the name of the object store's key path.
                 * @public
                 * @method getKeyPath
                 * @param {Object} databaseObject The name and properties of the database
                 * @param {Object} objectStoreObject The name and properties of the object store
                 * @param {Object} indecesObject The name and properties of the indeces object
                 * @param {Object} getKeyPathCallback the callback function to fire on success
                 */
                getKeyPathWithPromise: function (databaseObject, objectStoreObject, indecesObject) {
                    var deferred, keyPath;
                    deferred = $q.defer();
                    ConnectionManager.openConnectionWithPromise(databaseObject, objectStoreObject, indecesObject).then(function (data) {
                        keyPath = data.transaction([objectStoreObject.name])
                            .objectStore(objectStoreObject.name).keyPath;
                        deferred.resolve(keyPath);
                    });
                    return deferred.promise;
                },
                /**
                 * Get an array containing the name of all the indexed columns in the data store.
                 * @public
                 * @method getIndecesNames
                 * @param {Object} databaseObject The name and properties of the database
                 * @param {Object} objectStoreObject The name and properties of the object store
                 * @param {Object} indecesObject The name and properties of the indeces object
                 * @param {Object} getIndecesNamesCallback the callback function to fire on success
                 */
                getIndeceNames: function (databaseObject, objectStoreObject, indecesObject, getIndeceNamesCallback) {
                    var callback;
                    callback = function (databaseObject, objectStore) {
                        var indeceNames;
                        indeceNames = [];
                        indeceNames = databaseObject.Db.transaction([objectStore.name])
                            .objectStore(objectStore.name).indexNames;
                        if (getIndeceNamesCallback !== undefined) {
                            getIndeceNamesCallback(indeceNames);
                        }
                    };
                    ConnectionManager.openConnection(databaseObject, objectStoreObject, indecesObject, callback);
                },
                /**
                 * Get an array containing the name of all the indexed columns in the data store.
                 * @public
                 * @method getIndecesNamesWithPromise
                 * @param {Object} databaseObject The name and properties of the database
                 * @param {Object} objectStoreObject The name and properties of the object store
                 * @param {Object} indecesObject The name and properties of the indeces object
                 *
                 * @param {Array} $q.promise The array of indeces names from the selected datastore
                 */
                getIndeceNamesWithPromise: function (databaseObject, objectStoreObject, indecesObject) {
                    var deferred;
                    deferred = $q.defer();
                    ConnectionManager.openConnectionWithPromise(databaseObject, objectStoreObject, indecesObject).then(function (data) {
                        var indeceNames;
                        indeceNames = [];
                        indeceNames = data.transaction([objectStoreObject.name])
                            .objectStore(objectStoreObject.name).indexNames;
                        deferred.resolve(indeceNames);
                    });
                    return deferred.promise;
                },
                /**
                 * Delete all the records from each object store in the database
                 * @public
                 * @method clearObjectStores
                 * @param {Object} databaseObject The name and properties of the database
                 * @param {Object} objectStoreObject The name and properties of the object store
                 * @param {Object} indecesObject The name and properties of the indeces object
                 */
                clearObjectStores: function (databaseObject, objectStoreObject, indecesObject) {
                    var callback, objectStores;
                    objectStores = [];
                    callback = function (databaseObject, objectStore) {
                        var store;
                        objectStores = databaseObject.objectStoreNames;
                        for (store in objectStores) {
                            if (objectStores.hasOwnProperty(objectStore)) {
                                clearDataFromObjectStore(databaseObject, objectStores[store]);
                            }
                        }
                    };
                    ConnectionManager.openConnection(databaseObject, objectStoreObject, indecesObject, callback);
                },
                /**
                 * Delete all records in the object store
                 * @public
                 * @method deleteAll
                 * @param {Object} databaseObject The name and properties of the database
                 * @param {Object} objectStoreObject The name and properties of the object store
                 * @param {Object} indecesObject The name and properties of the indeces object
                 */
                deleteAll: function (databaseObject, objectStoreObject, indecesObject) {
                    var callback;
                    callback = function (databaseObject, objectStore) {
                        clearDataFromObjectStore(databaseObject, objectStore.name);
                    };
                    ConnectionManager.openConnection(databaseObject, objectStoreObject, indecesObject, callback);
                }
            };
        }]);
}());
