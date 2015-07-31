/*global angular*/
(function () {
    'use strict';
    angular.module('TestController.Controller', [])
        .controller('TestController', ['TransactionFactory', 'DatabaseObject', 'ObjectStore', 'IndecesObject',
                                      function (TransactionFactory, DatabaseObject, ObjectStore, IndecesObject) {
            var self, myDatabaseObject, myObjectStoreObject, myIndecesObject, itemsToAdd, i;
            self = this;
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
            self.insertData = function () {
                TransactionFactory.insert(myDatabaseObject, myObjectStoreObject, myIndecesObject, itemsToAdd);
            };
            self.deleteRow = function () {
                TransactionFactory.delete(myDatabaseObject, myObjectStoreObject, myIndecesObject, 3);
            };
            self.getByKey = function () {
                var callback;
                callback = function (data) {
                    alert(data);
                };
                TransactionFactory.getByKey(myDatabaseObject, myObjectStoreObject, myIndecesObject, 4, callback);
            };
            self.updateByKey = function () {
                var updatedObject;
                updatedObject = {
                    TestId: 5,
                    Column1: 'Test Data was updated 5',
                    Column2: 'I ain\'t no dummy'
                };
                TransactionFactory.updateDataByKey(myDatabaseObject, myObjectStoreObject, myIndecesObject, updatedObject);
            };
    }]);
}());
