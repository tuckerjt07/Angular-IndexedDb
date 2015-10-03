/*global angular*/
(function () {
    'use strict';
    angular.module('TestController.Controller', [])
        .controller('MainCtrl', ['$scope', 'TransactionFactory', 'DatabaseObject', 'ObjectStore', 'IndecesObject', 'HelperFactory',
                                 function ($scope, TransactionFactory, DatabaseObject, ObjectStore, IndecesObject, HelperFactory) {
            var self, myDatabaseObject, myObjectStoreObject, myIndecesObject, itemsToAdd, i, transactionComplete, getKeyPath;
            self = this;
            self.results = [];
            self.data = {};
            self.singleRecord = null;
            DatabaseObject.DbName = 'TestDb';
            DatabaseObject.DbVersion = 1;
            ObjectStore.name = 'TestObject';
            ObjectStore.keyPath = 'TestId';
            IndecesObject = [];
            IndecesObject.push({name: 'TestId', unique: false });
            IndecesObject.push({name: 'Column1', unique: false });
            itemsToAdd = [];
            for (i = 0; i < 10; i++) {
                itemsToAdd.push({
                    TestId: i,
                    Column1: 'Test Data ' + i,
                    Column2: 'Dummy data ' + i
                });
            }
            myDatabaseObject = JSON.parse(JSON.stringify(DatabaseObject));
            myObjectStoreObject = JSON.parse(JSON.stringify(ObjectStore));
            myIndecesObject = JSON.parse(JSON.stringify(IndecesObject));
            transactionComplete = function () {
                self.selectAll();
            };
            getKeyPath = function (getKeyPathCallback) {
                var callback;
                callback = function (keyPath) {
                    if (getKeyPathCallback !== undefined) {
                        getKeyPathCallback(keyPath);
                    }
                };
                TransactionFactory.getKeyPath(myDatabaseObject, myObjectStoreObject, myIndecesObject, callback);
            };
            self.insertData = function () {
                TransactionFactory.insert(myDatabaseObject, myObjectStoreObject, myIndecesObject, itemsToAdd);
                transactionComplete();
            };
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
            self.selectAll = function () {
                var callback;
                callback = function (data) {
                    self.results = data;
                    $scope.$apply();
                };
                TransactionFactory.selectAll(myDatabaseObject, myObjectStoreObject, myIndecesObject, callback);
            };
    }]);
}());
