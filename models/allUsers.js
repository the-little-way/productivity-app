const mongoose = require('mongoose');

//store these user data into allVals
var allUsers = mongoose.model('allUsers', {
	username: String,
	password: String
});


module.exports = {
	allUsers : allUsers
};
//ES6 shorthand export {allUsers}