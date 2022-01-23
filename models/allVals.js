const mongoose = require('mongoose');

//store these user data into allVals
var allVals = mongoose.model('allVals', {
	newActs: [],
	Today: String,
	link: String, //used for href '/' + getTime()
	username: String
});


module.exports = {
	allVals : allVals
};
//ES6 shorthand export {allVals}