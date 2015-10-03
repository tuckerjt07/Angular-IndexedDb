/*global angular*/
(function () {
    'use strict';
    angular.module('TestController.Controller', [])
        .controller('MainCtrl', ['$scope', 'TransactionFactory', 'DatabaseObject', 'ObjectStore', 'IndecesObject',
                                      function ($scope, TransactionFactory, DatabaseObject, ObjectStore, IndecesObject) {
            var self, myDatabaseObject, myObjectStoreObject, myIndecesObject, itemsToAdd, i, transactionComplete;
            self = this;
            self.results = [];
            self.data = {};
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
            self.insertData = function () {
                TransactionFactory.insert(myDatabaseObject, myObjectStoreObject, myIndecesObject, itemsToAdd);
                transactionComplete();
            };
            self.deleteRow = function (rowToDelete) {
                alert(rowToDelete);
                rowToDelete = rowToDelete === undefined ? 3 : parseInt(rowToDelete, 10);
                TransactionFactory.delete(myDatabaseObject, myObjectStoreObject, myIndecesObject, rowToDelete);
                transactionComplete();
            };
            self.getByKey = function () {
                var callback;
                callback = function (data) {
                    self.singleRow = data;
                    transactionComplete();
                };
                TransactionFactory.getByKey(myDatabaseObject, myObjectStoreObject, myIndecesObject, 4, callback);
            };
            self.updateByKey = function (rowToUpdate) {
                rowToUpdate = rowToUpdate === undefined ? {
                    TestId: 5,
                    Column1: 'Test Data was updated 5',
                    Column2: 'I ain\'t no dummy'
                } : {
                    TestId: parseInt(rowToUpdate.TestId, 10),
                    Column1: rowToUpdate.Column1,
                    Column2: rowToUpdate.Column2
                };
                TransactionFactory.updateDataByKey(myDatabaseObject, myObjectStoreObject, myIndecesObject, rowToUpdate);
                transactionComplete();
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
