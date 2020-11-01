
let crypto = require('crypto');
let config = require('./config');

const helpers = {};

helpers.hash = (str) => {
    return crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
};

helpers.parsJsonToObject = (json) => {
    try{
        return JSON.parse(json);
    }catch (e){
        return {};
    }
}

helpers.equal = (strOne, strTwo)=>{

}

module.exports = helpers;