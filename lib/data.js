/*

This file to store and edit data
 */

// Dependencies
var fs = require('fs');
var path = require('path');

// create container
let lib = {};

lib.baseDir = path.join(__dirname,'/../.data/');

// write data to file
lib.create = (dir, file, data, callback) => {
    // Open file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json', 'wx', (err, fileDescriptor) => {
       if(!err && fileDescriptor){
           // Convert data to string
           let stringData = JSON.stringify(data);

           // Write to file and close it

           fs.writeFile(fileDescriptor, stringData,  (err) => {
               if(!err){
                   fs.close(fileDescriptor, (err) => {
                       if(!err){
                           callback(false);
                       }else{
                           callback('Error closing new file');
                       }
                   });
               }else{
                   callback('Error writing to new file');
               }
           });
       } else{
           callback('Could not create file, it may already exist');
       }
    });
};

// read data
lib.read = (dir,file,callback) => {
    fs.readFile(lib.baseDir+dir+'/'+file+'.json', 'utf8', (err,data) =>{
        callback(err,data);
    });

};

// update data
lib.update = (dir,file,data, callback) => {
    fs.open(lib.baseDir+dir+'/'+file+'.json', 'r+', (err, fileDescriptor) => {
        if(!err && fileDescriptor){
            // Convert data to string
            let stringData = JSON.stringify(data);

            // truncate to file and close it
            fs.ftruncate(fileDescriptor,   (err) => {
                if(err){
                    callback('Error truncating new file');
                }
                // write to the file
                fs.writeFile(fileDescriptor, stringData,  (err) => {
                    if (err) {
                        callback('Error writing new file');
                    }
                    fs.close(fileDescriptor, (err) => {
                        if (err) {
                            callback('Error closing new file');
                        }
                        callback(false);
                    });
                });
            });
        } else{
            callback('Could not open file');
        }
    });
};

// delete file

lib.delete = (dir,file, callback) => {
  // remove file from system

  fs.unlink(lib.baseDir+dir+'/'+file+'.json', (err) => {
      if(err){
          callback('File does not exists');
      }
  });
};

//export
module.exports = lib;