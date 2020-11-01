
// Dependencies
const _data = require('./data');
const helpers = require('./helpers');

// Define the handlers
const handlers = {};

handlers.sample = (data,callback) => {
    // callback back http status code and payload object
    callback(406, {"name":"sample page"});
};
handlers.users = (data,callback) => {
    let acceptableMethods = ['post', 'get', 'put', 'delete'];

    if(acceptableMethods.indexOf(data.method) > -1){
        handlers._users[data.method](data, callback);
    }else{
        callback(405);
    }
};

handlers._users = {};

handlers._users.post = (data, callback) => {
    let firstName = validate(data.payload.firstName, "string", 0);
    let lastName = validate(data.payload.lastName, "string", 0);
    let phone = validate(data.payload.phone, "string", 10);
    let password = validate(data.payload.password, "string", 0);
    let tosAgreement = validate(data.payload.tosAgreement, "boolean");

    if(firstName && lastName && phone && password && tosAgreement){
        // make sure that user not exists
        _data.read('users/', phone, (err, userData) => {
            if(err){
                let hashedPassword = helpers.hash(password);

                let userObject = {
                    firstName: firstName,
                    lastName: lastName,
                    phone: phone,
                    password: hashedPassword,
                    tosAgreement: tosAgreement,
                };
                _data.create('users/', phone, userObject, (err) => {
                   if(err) callback(400, {'Error' : err});

                   else callback(200);
                });
            }else{
                callback(400, {'Error' : "User already exists"});
            }
        });
    }else{
        callback(400, {"Error": "Missing required fields"});
    }
};
handlers._users.get = (data, callback) => {

};
handlers._users.put = (data, callback) => {

};
handlers._users.delete = (data, callback) => {

};

handlers.hello = (data,callback) => {
    // callback back http status code and payload object
    callback(200, {"message":"Hello World!!"});
};

handlers.ping = (data,callback) => {
    // callback back http status code and payload object
    callback(200, {"status":"app is live"});
};
handlers.notFound = (data,callback) => {
    callback(404);
};

let validate = (str, type, length = 0) => {
    if(type == "boolean") return typeof (str) === type && str === true;

    return typeof(str) === type && str.trim().length > length ? str.trim() : false;
}

module.exports = handlers;