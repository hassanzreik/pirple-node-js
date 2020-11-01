
let crypto = require('crypto');
let config = require('./config');
const _data = require('./data');

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


helpers.validate = (str, type, length = 0) => {
    if(type === "boolean") return typeof (str) === type && str === true;

    return typeof(str) === type && str.trim().length >= length ? str.trim() : false;
}

helpers.createToken = (length) => {

    length = typeof(length) === 'number' && length > 0 ? length : false;

    if(length){
        let tokenId = '';
        let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for (let i = 0; i < length; i++ ) {
            tokenId += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return tokenId;
    }else{
        return false;
    }
}
module.exports = helpers;