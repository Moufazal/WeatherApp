var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    city: [{type: mongoose.Schema.Types.ObjectID, ref: 'city'}],
    username: String,
    email: String,
    password: String,
});

var userModel = mongoose.model('users', userSchema );

module.exports = userModel;