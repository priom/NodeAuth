// User MODEL for MONGODB
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
// connect to mongo
var db = mongoose.connection;

// User schema
var UserSchema = mongoose.Schema({
    username: {
        type: String,
        index: true
    },
    password: {
        type: String, required:true, bcrypt: true
    },
    email: {
        type: String
    },
    name: {
        type: String
    },
    profileimage: {
        type: String
    }
});

var User = module.exports = mongoose.model('User', UserSchema);

// check password with the database
module.exports.comparePassword = function(candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword), hash, function(err, isMatch) {
        if(err) return callback(err);
        callback(null, isMatch);
    }
}

// query for login
module.exports.getUserById = function(id, callback) {
    // var query = { username: username };
    User.findById(query, callback);
}
module.exports.getUserByUsername = function(username, callback) {
    var query = { username: username };
    User.findOne(query, callback);
}

// create new user with hashed password
module.exports.createUser = function(newUser, callback) {
    bcrypt.hash(newUser.password, 10, function(err, hash) {
        if(err) throw err;
        // set hashed password
        newUser.password = hash;
        // create user
        newUser.save(callback);
    });
}
