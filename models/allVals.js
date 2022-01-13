const mongoose = require('mongoose');

//store these user data into allVals
var allVals = mongoose.model('allVals', {
	newActs: [],
	Today: "",
	link: "", //used for href '/' + getTime()
	username: "",
	password: ""
});


module.exports = {
	allVals : allVals
};
//ES6 shorthand export {allVals}