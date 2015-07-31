# Angular-IndexedDb
This project is a collection of Angular factories dedicated to interacting with the built in IndexedDb browser database.

This project is still in its infancy stage and as such will be violatile as it undergoes further maturity, development, and code coverage.

The goal of this project is to be a comprehensive API for the browser based IndexedDb Database that can be injected into Angular.

In order to utilize the current API all requests need to be made through the TransactionFactory.

This module contains four methods at the moment.

.insert: databaseObject, objectStoreObject, indecesObject, itemsToAdd

  databaseObject
  
    DbName: Type: String 'The name of the database',
    
    DbVersion: Type: Number 'The current version of the database',
    
    Db: {} Type: Empty Object 'This is used internally by the project to hold a created database instance'.
    
    databaseObject is a value template provided under the DatabaseObject value and is meant to be modified in the controller
      before makeing a call
  
To do document the rest of the API
    
