var admin = require('firebase-admin');

var ref = admin.app().database().ref();
var usersRef = ref.child('users');
var userRef = usersRef.push();
var passwordHash = require('password-hash');

/**
 * Create new user
 * @param {String} first name
 * @param {String} last name
 * @param {String} username (email)
 * @param {String} password 
 */
var add_user = function (first, last, username, password) {
    return new Promise(function (resolve, reject) {
        usersRef.push({
            email: username,
            password: hash_password(password),
            first:first,
            last:last
        }, (error) => {
            reject(false);
        });
        resolve(true);
    });
}
/**
 * find a user based on their username
 * @param {String} username 
 * @returns returns user info if a user is found (false otherwise)
 */
var find_user_info = function (username) {
    return new Promise(function (resolve, reject) {
        usersRef.on('value', function (snap) {
            snap.forEach(function (child) {
                let val = child.val();
                let email = val.email;
                let pass = val.password;
                let key = child.key;
                let first = child.first, last = child.last;
                let user_obj = {
                    username: email,
                    password: pass,
                    first:first,
                    last:last,
                    key: key
                }
                if (username == email) resolve(user_obj);//User exists
            });
            reject(false);//User doesn't exists
        });
    });
}

/**
 * Encrypt user supplied password
 * @param {*} password is the password to be encrypted
 */
var hash_password = function (password){
    return passwordHash.generate(password);
}

/**
 * Verify user supplied password
 * @param {*} password is the user supplied password
 * @param {*} hash is what is stored in the DB
 */
var verify_password = function (password, hash){
    return passwordHash.verify(password, hash);
}

module.exports = {
    sign_up: async function(first, last, username, password){
        //Check if user alread exists
        let res = await find_user_info(username).catch((err) => {
            return false;
        })
        //If not add user
        if(!res){
            return await add_user(first, last, username, password).catch((err) => {return false;})
        }
        return false;
    },
    login: async function (username, password) {
        //Check if user exists
        let res = await find_user_info(username).catch((err) => {
            return false;
        })
        //Check if password hash is correct
        if (res) {
            if(verify_password(password, res.password)) return true;
        }
        return false;
    },
    get_user_profile: async function (username) {
        //check if user exists
        let res = await find_user_info(username).catch((err) => {
            return false;
        });
        if (!res) return false;
        let profile = {
            username: res.username,
            first: res.first,
            last: res.last
        };
        return profile;
    },
}