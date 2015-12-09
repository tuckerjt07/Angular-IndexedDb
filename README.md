# Angular-IndexedDb
This project is a collection of Angular factories dedicated to interacting with the built in IndexedDb browser database.

This project is close to being production ready pending test case creation.

The goal of this project is to be a comprehensive API for the browser based IndexedDb Database that can be injected into Angular.

In order to utilize the current API all requests need to be made through the TransactionFactory.

This module contains four methods (for now): insert, delete, getByKey, updateDataByKey

.insert: databaseObject, objectStoreObject, indecesObject, itemsToAdd

  Inserts an array of items into the database

    databaseObject Type: Object
    
      DbName: Type: String 'The name of the database',
      
      DbVersion: Type: Number 'The current version of the database',
      
      Db: {} Type: Empty Object 'This is used internally by the project to hold a created database instance'.
      
      databaseObject is a value template provided under the DatabaseObject value and is meant to be modified in the controller
        before makeing a call
    
    objectStoreObject Type: Object
    
      name: Type: String 'The name of the database',
      
      keyPath: Type: String 'If you wish to provide the column name for the primary key this is where you enter it'
      
      autoIncrement: Type: Boolean 'Defaults to false, if set to true the primary key value will be an auto-incrementing int.'
    
      createdObjectStore: is a value template provided under the ObjectStore value and is meant to be modified in the controller before makeing a call
      
    indecesObject Type: Array An array of the desired indeces
    
    {
      name: Type: String 'Name of the index,
      params: {
        unique: Type: Boolean 'Is the index value required to be unique? If so true, else false'
        }
    }
    
    itemsToAdd Type: Array
    
      An array of items to be inserted into the database
  
  delete: databaseObject, objectStoreObject, indecesObject, keyToDelete  
  
    Deletes a row from the database by its key value
  
    databaseObject Type: Object
    
      DbName: Type: String 'The name of the database',
      
      DbVersion: Type: Number 'The current version of the database',
      
      Db: {} Type: Empty Object 'This is used internally by the project to hold a created database instance'.
      
      databaseObject is a value template provided under the DatabaseObject value and is meant to be modified in the controller
        before makeing a call
    
    objectStoreObject Type: Object
    
      name: Type: String 'The name of the database',
      
      keyPath: Type: String 'If you wish to provide the column name for the primary key this is where you enter it'
      
      autoIncrement: Type: Boolean 'Defaults to false, if set to true the primary key value will be an auto-incrementing int.'
    
      createdObjectStore: is a value template provided under the ObjectStore value and is meant to be modified in the controller before makeing a call
      
    indecesObject Type: Array An array of the desired indeces
    
    {
      name: Type: String 'Name of the index,
      params: {
        unique: Type: Boolean 'Is the index value required to be unique? If so true, else false'
        }
    }
    
    keyToDelete Type: Number or String 'The key value of the row to be deleted'
    
  getByKey: databaseObject, objectStoreObject, indecesObject, keyValue, setValueCallback
  
    Gets a row from the database by its key value
  
    databaseObject Type: Object
    
      DbName: Type: String 'The name of the database',
      
      DbVersion: Type: Number 'The current version of the database',
      
      Db: {} Type: Empty Object 'This is used internally by the project to hold a created database instance'.
      
      databaseObject is a value template provided under the DatabaseObject value and is meant to be modified in the controller
        before makeing a call
    
    objectStoreObject Type: Object
    
      name: Type: String 'The name of the database',
      
      keyPath: Type: String 'If you wish to provide the column name for the primary key this is where you enter it'
      
      autoIncrement: Type: Boolean 'Defaults to false, if set to true the primary key value will be an auto-incrementing int.'
    
      createdObjectStore: is a value template provided under the ObjectStore value and is meant to be modified in the controller before makeing a call
      
    indecesObject Type: Array An array of the desired indeces
    
    {
      name: Type: String 'Name of the index,
      params: {
        unique: Type: Boolean 'Is the index value required to be unique? If so true, else false'
        }
    }
    
    keyValue Type: Number or String 'The key value of the row to be retrieved'
    
    setValueCallback Type: Function 'The function to be called to return the retrieved object to'
  
  updateDataByKey: databaseObject, objectStoreObject, indecesObject, updatedObject
    
      Updates an existing object in the database
  
      databaseObject Type: Object
      
        DbName: Type: String 'The name of the database',
        
        DbVersion: Type: Number 'The current version of the database',
        
        Db: {} Type: Empty Object 'This is used internally by the project to hold a created database instance'.
        
        databaseObject is a value template provided under the DatabaseObject value and is meant to be modified in the controller
          before makeing a call
      
      objectStoreObject Type: Object
      
        name: Type: String 'The name of the database',
        
        keyPath: Type: String 'If you wish to provide the column name for the primary key this is where you enter it'
        
        autoIncrement: Type: Boolean 'Defaults to false, if set to true the primary key value will be an auto-incrementing int.'
      
        createdObjectStore: is a value template provided under the ObjectStore value and is meant to be modified in the controller before makeing a call
        
      indecesObject Type: Array An array of the desired indeces
      
      {
        name: Type: String 'Name of the index,
        params: {
          unique: Type: Boolean 'Is the index value required to be unique? If so true, else false'
          }
      }
      
      updatedObject Type: String, Number, Object 'The object with the updated values to be put into the database'
    
    
