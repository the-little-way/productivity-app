const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/To-do', (err)=>{
	if (!err) {
		console.log('MongoDB is now connected...');
	}
	else {
		console.log('Oops! Error reaching MongoDB:' + JSON.stringigy(err, undefined, 2));
	}
});

module.exports = mongoose;