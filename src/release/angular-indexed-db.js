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
                        objectStore.createdObjectStore.oncomplete = function () {
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
/*global angular */
(function () {
    'use strict';
    angular.module('DatabaseObject.value', [])
        .value('DatabaseObject', {
        DbName: '',
        DbVersion: '',
        Db: {}
    });
}());
/*global angular */
(function () {
    'use strict';
    angular.module('IndecesObject.value', [])
        .value('IndecesObject', [
            {
                name: '',
                params: {
                    unique: false
                }
            }
        ]);
}());
/*global angular */
(function () {
    'use strict';
    angular.module('ObjectStore.value', [])
        .value('ObjectStore', {
            name: '',
            keyPath: '',
            autoIncrement: false,
            createdObjectStore: null
        });
}());
/*global angular */
/*jshint -W083 */
(function () {
    'use strict';
    angular.module('TransactionFactory.factory', [])
        .factory('TransactionFactory', ['ConnectionManager',
            function (ConnectionManager) {
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
                    },
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
                    }
                };
        }]);
}());
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
                        objectStore.createdObjectStore.oncomplete = function () {
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
/*global angular */
(function () {
    'use strict';
    angular.module('DatabaseObject.value', [])
        .value('DatabaseObject', {
        DbName: '',
        DbVersion: '',
        Db: {}
    });
}());
/*global angular */
(function () {
    'use strict';
    angular.module('IndecesObject.value', [])
        .value('IndecesObject', [
            {
                name: '',
                params: {
                    unique: false
                }
            }
        ]);
}());
/*global angular */
(function () {
    'use strict';
    angular.module('ObjectStore.value', [])
        .value('ObjectStore', {
            name: '',
            keyPath: '',
            autoIncrement: false,
            createdObjectStore: null
        });
}());
/*global angular */
/*jshint -W083 */
(function () {
    'use strict';
    angular.module('TransactionFactory.factory', [])
        .factory('TransactionFactory', ['ConnectionManager',
            function (ConnectionManager) {
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
                    },
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
                    }
                };
        }]);
}());
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
                        objectStore.createdObjectStore.oncomplete = function () {
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
/*global angular */
(function () {
    'use strict';
    angular.module('DatabaseObject.value', [])
        .value('DatabaseObject', {
        DbName: '',
        DbVersion: '',
        Db: {}
    });
}());
/*global angular */
(function () {
    'use strict';
    angular.module('IndecesObject.value', [])
        .value('IndecesObject', [
            {
                name: '',
                params: {
                    unique: false
                }
            }
        ]);
}());
/*global angular */
(function () {
    'use strict';
    angular.module('ObjectStore.value', [])
        .value('ObjectStore', {
            name: '',
            keyPath: '',
            autoIncrement: false,
            createdObjectStore: null
        });
}());
/*global angular */
/*jshint -W083 */
(function () {
    'use strict';
    angular.module('TransactionFactory.factory', [])
        .factory('TransactionFactory', ['ConnectionManager',
            function (ConnectionManager) {
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
                    },
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
                    }
                };
        }]);
}());
/*global angular */
(function () {
    'use strict';
    angular.module('IndexedDb.Utils', ['ConnectionFactory.factory', 'DatabaseObject.value', 'ObjectStore.value', 'IndecesObject.value',
                                       'TransactionFactory.factory', 'TestController.Controller', 'Helper.factory']);
}());
/*global angular */
(function () {
    'use strict';
    angular.module('Helper.factory', [])
        .factory('HelperFactory', [function () {
            return {
                getFieldType: function (value) {
                    return typeof value;
                }
            };
        }]);
}());
/*global angular */
(function () {
    'use strict';
    angular.module('IndexedDb.Utils', ['ConnectionFactory.factory', 'DatabaseObject.value', 'ObjectStore.value', 'IndecesObject.value',
                                       'TransactionFactory.factory', 'TestController.Controller', 'Helper.factory']);
}());
/*global angular */
(function () {
    'use strict';
    angular.module('Helper.factory', [])
        .factory('HelperFactory', [function () {
            return {
                getFieldType: function (value) {
                    return typeof value;
                }
            };
        }]);
}());
/*global angular */
(function () {
    'use strict';
    angular.module('IndexedDb.Utils', ['ConnectionFactory.factory', 'DatabaseObject.value', 'ObjectStore.value', 'IndecesObject.value',
                                       'TransactionFactory.factory', 'TestController.Controller', 'Helper.factory']);
}());
/*global angular */
(function () {
    'use strict';
    angular.module('Helper.factory', [])
        .factory('HelperFactory', [function () {
            return {
                getFieldType: function (value) {
                    return typeof value;
                }
            };
        }]);
}());
