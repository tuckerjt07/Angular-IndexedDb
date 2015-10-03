/*global angular*/
(function () {
    'use strict';
    angular.module('TestController.Controller', [])
        .controller('MainCtrl', ['$scope', 'TransactionFactory', 'DatabaseObject', 'ObjectStore', 'IndecesObject', 'HelperFactory',
                                 function ($scope, TransactionFactory, DatabaseObject, ObjectStore, IndecesObject, HelperFactory) {
                //Delcare all function variables
                var self, myDatabaseObject, myObjectStoreObject, myIndecesObject, itemsToAdd, i, transactionComplete, getKeyPath, getIndeceNames;
                //Assign this to self so that it can be used throughout the function
                self = this;
                //Assign and initialize self variables
                self.results = [];
                self.data = {};
                self.indeceNames = [];
                self.columnNames = [];
                self.singleRecord = null;
                self.singleIndexRecord = null;
                self.recordsByPosition = null;
                self.valueForColumnRecords = null;
                self.valueForFreeText = null;
                //Assign values for the injected models in this controller
                DatabaseObject.DbName = 'TestDb';
                DatabaseObject.DbVersion = 1;
                ObjectStore.name = 'TestObject';
                ObjectStore.keyPath = 'TestId';
                IndecesObject = [];
                IndecesObject.push({
                    name: 'TestId',
                    unique: false
                });
                IndecesObject.push({
                    name: 'Column1',
                    unique: false
                });
                //Instantiate and add test data
                itemsToAdd = [];
                for (i = 0; i < 10; i++) {
                    itemsToAdd.push({
                        TestId: i,
                        Column1: 'Test Data ' + i,
                        Column2: 'Dummy data ' + i
                    });
                }
                //Perform a deep copy to remove pass by reference and simulate pass by value
                myDatabaseObject = JSON.parse(JSON.stringify(DatabaseObject));
                myObjectStoreObject = JSON.parse(JSON.stringify(ObjectStore));
                myIndecesObject = JSON.parse(JSON.stringify(IndecesObject));
                //When the transaction completes perform a select all on the database
                transactionComplete = function () {
                    self.selectAll();
                };
                //Get the keypath for the object store
                getKeyPath = function (getKeyPathCallback) {
                    var callback;
                    callback = function (keyPath) {
                        if (getKeyPathCallback !== undefined) {
                            getKeyPathCallback(keyPath);
                        }
                    };
                    TransactionFactory.getKeyPath(myDatabaseObject, myObjectStoreObject, myIndecesObject, callback);
                };
                //Get the indeces for the object store
                getIndeceNames = function (getIndeceNamesCallback) {
                    var callback;
                    callback = function (indeceNames) {
                        if (getIndeceNamesCallback !== undefined) {
                            getIndeceNamesCallback(indeceNames);
                        }
                    };
                    TransactionFactory.getIndeceNames(myDatabaseObject, myObjectStoreObject, myIndecesObject, callback);
                };
                //Inserts a new record into the database
                self.insertData = function () {
                    TransactionFactory.insert(myDatabaseObject, myObjectStoreObject, myIndecesObject, itemsToAdd);
                    transactionComplete();
                };
                //Delete the passed row from the database
                self.deleteRow = function (rowToDelete) {
                    var callback, dataType;
                    callback = function (keyPathName) {
                        var firstRecordCallback;
                        firstRecordCallback = function (data) {
                            dataType = HelperFactory.getFieldType(data[0][keyPathName]);
                            if (rowToDelete !== null && rowToDelete !== undefined) {
                                rowToDelete = dataType === 'number' ? parseInt(rowToDelete, 10) : rowToDelete;
                            }
                            TransactionFactory.delete(myDatabaseObject, myObjectStoreObject, myIndecesObject, rowToDelete);
                            transactionComplete();
                        };
                        TransactionFactory.selectByPosition(myDatabaseObject, myObjectStoreObject, myIndecesObject, 0, 0, firstRecordCallback);
                    };
                    getKeyPath(callback);
                };
                //Get a record by the passed keypath value
                self.getByKey = function (keyValue) {
                    var callback, keyPathTypeCallback, dataType;
                    self.singleRecord = null;
                    keyPathTypeCallback = function (keyPathName) {
                        var firstRecordCallback;
                        firstRecordCallback = function (data) {
                            dataType = HelperFactory.getFieldType(data[0][keyPathName]);
                            if (keyValue !== null && keyValue !== undefined) {
                                keyValue = dataType === 'number' ? parseInt(keyValue, 10) : keyValue;
                            }
                            TransactionFactory.getByKey(myDatabaseObject, myObjectStoreObject, myIndecesObject, keyValue, callback);
                        };
                        TransactionFactory.selectByPosition(myDatabaseObject, myObjectStoreObject, myIndecesObject, 0, 0, firstRecordCallback);
                    };
                    getKeyPath(keyPathTypeCallback);
                    callback = function (data) {
                        self.singleRecord = data !== undefined ? data : null;
                        transactionComplete();
                    };
                };
                //Get a single record by the passed index value and index name
                self.getByIndex = function (indexValue, indexName) {
                    var callback, firstRecordCallback, dataType;
                    self.singleIndexRecord = null;
                    firstRecordCallback = function (data) {
                        if (indexValue !== null && indexValue !== undefined && indexName !== null && indexName !== undefined) {
                            dataType = HelperFactory.getFieldType(data[0][indexName.Text]);
                            indexValue = dataType === 'number' ? parseInt(indexValue, 10) : indexValue;
                        }
                        TransactionFactory.getByIndex(myDatabaseObject, myObjectStoreObject, myIndecesObject, indexValue, indexName.Text, callback);
                    };
                    TransactionFactory.selectByPosition(myDatabaseObject, myObjectStoreObject, myIndecesObject, 0, 0, firstRecordCallback);
                    callback = function (data) {
                        self.singleIndexRecord = data !== undefined ? data : null;
                        transactionComplete();
                    };
                };
                //Get records by the passed value and column name
                self.getByValue = function (value, columnName) {
                    var callback;
                    self.valueForColumnRecords = null;
                    callback = function (data) {
                        self.valueForColumnRecords = data;
                        $scope.$apply();
                    };
                    TransactionFactory.getByValue(myDatabaseObject, myObjectStoreObject, myIndecesObject, value, columnName.Text, callback);

                };
                //Get record based on a free text search
                self.freeTextSearch = function (value) {
                    var callback;
                    self.valueForFreeText = null;
                    callback = function (data) {
                        self.valueForFreeText = data;
                        $scope.$apply();
                    };
                    TransactionFactory.freeTextSearch(myDatabaseObject, myObjectStoreObject, myIndecesObject, value, callback);
                };
                //Get records based on 0 index position in the obejct store
                self.getByPosition = function (start, stop) {
                    var callback;
                    self.recordsByPosition = null;
                    callback = function (data) {
                        self.recordsByPosition = data;
                        $scope.$apply();
                    };
                    TransactionFactory.selectByPosition(myDatabaseObject, myObjectStoreObject, myIndecesObject, parseInt(start, 10), parseInt(stop, 10), callback);
                };
                //Update a record if it exists or add to the store if it does not
                self.updateByKey = function (rowToUpdate) {
                    var callback, dataType;
                    callback = function (keyPathName) {
                        var firstRecordCallback;
                        firstRecordCallback = function (data) {
                            dataType = HelperFactory.getFieldType(data[0][keyPathName]);
                            if (rowToUpdate !== null && rowToUpdate !== undefined) {
                                rowToUpdate.TestId = dataType === 'number' ? parseInt(rowToUpdate.TestId, 10) : rowToUpdate.TestId;
                                TransactionFactory.updateDataByKey(myDatabaseObject, myObjectStoreObject, myIndecesObject, rowToUpdate);
                                transactionComplete();
                            }
                        };
                        TransactionFactory.selectByPosition(myDatabaseObject, myObjectStoreObject, myIndecesObject, 0, 0, firstRecordCallback);
                    };
                    getKeyPath(callback);
                };
                //Get all records
                self.selectAll = function () {
                    var callback;
                    callback = function (data) {
                        self.results = data;
                        $scope.$apply();
                    };
                    TransactionFactory.selectAll(myDatabaseObject, myObjectStoreObject, myIndecesObject, callback);
                };
                //Get the indece names for the object store
                self.getIndeceNames = function () {
                    var callback;
                    callback = function (data) {
                        var item;
                        for (item in data) {
                            if (data.hasOwnProperty(item)) {
                                self.indeceNames.push({
                                    Id: item,
                                    Text: data[item]
                                });
                            }
                        }
                        $scope.$apply();
                    };
                    getIndeceNames(callback);
                };
                //Get the column names for the object store
                self.getColumnNames = function () {
                    var callback, count;
                    count = 0;
                    callback = function (data) {
                        var columnName;
                        for (columnName in data[0]) {
                            self.columnNames.push({
                                Id: count,
                                Text: columnName
                            });
                            count++;
                        }
                        $scope.$apply();
                    };
                    TransactionFactory.selectByPosition(myDatabaseObject, myObjectStoreObject, myIndecesObject, 0, 0, callback);
                };
                //Call functions on page load
                self.getIndeceNames();
                self.getColumnNames();
    }]);
}());
