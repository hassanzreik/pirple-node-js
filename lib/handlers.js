
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
    let firstName = helpers.validate(data.payload.firstName, "string", 0);
    let lastName = helpers.validate(data.payload.lastName, "string", 0);
    let phone = helpers.validate(data.payload.phone, "string", 10);
    let password = helpers.validate(data.payload.password, "string", 0);
    let tosAgreement = helpers.validate(data.payload.tosAgreement, "boolean");

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

// Users - get
// Required data: phone
// Optional data: none
//@TODO Only let an authenticated user access their object. Don't let them access other data


handlers._users.get = (data, callback) => {

    let phone = helpers.validate(data.queryStringObject.phone, "string", 10);

    if(phone) {
        let token = helpers.validate(data.headers.token, "string", 20);
        handlers._tokens.verifyToken(token, phone, (isValidToken) => {
            if (isValidToken) {
                _data.read('users', phone, (err, data) => {
                    if (!err && data) {
                        // Remove the hashed password from the user
                        delete data.password;
                        callback(200, data);
                    } else {
                        callback(400, {'Error': "User does not found!"});
                    }
                });
            }else{
                callback(400, {'Error': "Invalid token!"});
            }
        });
    } else {
        callback(400, {'Error': "Phone number is required!"});
    }
};

// Users- Put
// Required data : phone
// optional data: firstname, lastname, password

handlers._users.put = (data, callback) => {
    // check for required field
    let phone = helpers.validate(data.payload.phone, "string", 10);

    // check for the optional fields
    let firstName = helpers.validate(data.payload.firstName, "string", 0);
    let lastName = helpers.validate(data.payload.lastName, "string", 0);
    let password = helpers.validate(data.payload.password, "string", 0);

    if(phone) {
        if(firstName || lastName || password){
            let token = helpers.validate(data.headers.token, "string", 20);
            handlers._tokens.verifyToken(token, phone, (isValidToken) => {
                if (isValidToken) {
                    _data.read('users',phone, (err, userData) => {

                        if(!err && userData){
                            // Remove the hashed password from the user
                            if(firstName){
                                userData.firstName = firstName;
                            }
                            if(lastName){
                                userData.lastName = lastName;
                            }
                            if(password){
                                userData.password = helpers.hash(password);
                            }

                            _data.update('users',phone, userData, (err) =>{

                                if(!err){
                                    callback(200);
                                }else{
                                    console.log(err);
                                    callback(500, {'Error': "could not update the user"});
                                }
                            });
                        }else{
                            callback(400, {'Error': "User does not found!"});
                        }
                    });
                }else{
                    callback(400, {'Error': "Invalid token!"});
                }
            });
        }else{
             callback(400, {"Error": "Missing Fields to update"});
        }
    }else{
        callback(400, {'Error': "Phone number is required!"});
    }
};

// Users - delete
// Required field : phone

handlers._users.delete = (data, callback) => {
    let phone = helpers.validate(data.queryStringObject.phone, "string", 10);
    if(phone){
        let token = helpers.validate(data.headers.token, "string", 20);
        handlers._tokens.verifyToken(token, phone, (isValidToken) => {
            if (isValidToken) {
                _data.read('users',phone,(err, data) => {

                    if(!err && data){
                        // Remove the hashed password from the user
                        _data.delete('users',phone,(err) => {
                            console.log(err);
                            if(!err) {
                                callback(200);
                            }else{
                                callback(500, {'Error': "something wend wrong!"});
                            }
                        });
                    }else{
                        callback(400, {'Error': "User does not found!"});
                    }
                });
            }else{
                callback(400, {'Error': "Invalid token!"});
            }
        });
    }else{
        callback(400, {'Error': "Phone number is required!"});
    }
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



handlers.tokens = (data,callback) => {
    let acceptableMethods = ['post', 'get', 'put', 'delete'];

    if(acceptableMethods.indexOf(data.method) > -1){
        handlers._tokens[data.method](data, callback);
    }else{
        callback(405);
    }
};
handlers._tokens = {};
// required data: phone and password
handlers._tokens.post = (data, callback) => {
    let phone = helpers.validate(data.payload.phone, "string", 10);
    let password = helpers.validate(data.payload.password, "string", 0);

    if(phone && password){
        _data.read('users',phone,(err, userData) => {
            if(!err && userData){
                if(helpers.hash(password) === userData.password){
                    let tokenId = helpers.createToken(20);
                    let expires = Date.now() + 1000 * 60 * 60;
                    let tokenObject = {
                        phone: phone,
                        token: tokenId,
                        expires: expires
                    }
                    _data.create('tokens/', tokenId, tokenObject, (err) => {
                        if(err) callback(400, {'Error' : err});

                        else callback(200, tokenObject);
                    });
                }else{
                    callback(400, {'Error': "Invalid password"});
                }
            }else{
                callback(400, {'Error': "User does not found!"});
            }
        });
    }else{
        callback(400, {'Error': 'Missing Required fields'});
    }
};
handlers._tokens.get = (data, callback) => {

    let token = helpers.validate(data.queryStringObject.token, "string", 20);
    if(token){
        _data.read('tokens',token,(err, data) => {

            if(!err && data){
                // _data.read('users',data.phone,(err, data) => {
                //
                //     if(!err && data){
                //
                //         callback(200, data);
                //     }else{
                //         callback(400, {'Error': "User does not found!"});
                //     }
                // });
                // Remove the hashed password from the user
                callback(200, data);
            }else{
                callback(400, {'Error': "User does not found!"});
            }
        });
    }else{
        callback(400, {'Error': "Token is required!"});
    }
};

handlers._tokens.put = (data, callback) => {

    let token = helpers.validate(data.payload.token, "string", 20);
    let extend = helpers.validate(data.payload.extend, "boolean");

    if(token && extend){

        _data.read('tokens',token, (err, data) => {
            if(!err && data){
                if(data.expires > Date.now()){
                    data.expires = Date.now() + 1000 * 60 * 60;

                    _data.update('tokens',token, data, (err) => {
                       if(err){
                           callback(400, {"Error": " Could not update token"})
                       } else{
                           callback(200);
                       }
                    });
                }else{
                    callback(400, {'Error': "Token Expired"});
                }
            }else{
                callback(400, {'Error': "Token is not found"});
            }
        })
    }else{
        callback(400, {"Error" : "Invalid request"});
    }
};
handlers._tokens.delete = (data, callback) => {
    let token = helpers.validate(data.queryStringObject.token, "string", 20);
    if(token){
        _data.read('tokens',token,(err, data) => {

            if(!err && data){
                // Remove the hashed password from the user
                _data.delete('tokens',token,(err) => {
                    console.log(err);
                    if(!err) {
                        callback(200);
                    }else{
                        callback(500, {'Error': "something wend wrong!"});
                    }
                });
            }else{
                callback(400, {'Error': "Token does not found!"});
            }
        });
    }else{
        callback(400, {'Error': "Token is required!"});
    }
};

handlers._tokens.verifyToken = (token, phone, callback) => {
    _data.read('tokens', token, (err, data) => {
        if(!err && data){
            if(data.phone === phone && data.expires > Date.now()){
                callback(true);
            }
            else{
                callback(false);
            }
        }else{
            callback(false);
        }
    });
};
module.exports = handlers;