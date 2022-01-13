const express = require ('express');
const app = express();
const bodyParser = require('body-parser');
const ejs = require('ejs');
const https = require('https');
const cors = require('cors');
const {mongoose} = require('./db.js');
const {allVals} = require('./models/allVals.js')

app.use(bodyParser.urlencoded({extended:true}));

app.set('view engine', 'ejs');

app.use(express.static('assets'));

app.listen(3000);


//temp storage
var savedItems = []; // pull info from db
var newActs = [];
var vals = {newItem: '',
			Today: '',
			City : '',
			Temp : '',
			Desc : '',
			Icon : '',
			savedItems: ''
		};
let username = "user1";
let refreshWeather = true;
let City = "Accra"; //default city

app.get('/', (req, res) => {

	//savedItems.link='/';
	allVals.find()
	.then((doc)=>{
		savedItems=doc
	});
	//console.log(savedItems);

	//use openweather API to get current weather
	// check weather once on the first render and then manually next time instead of on every page refresh
	
	//change city if user desires else use default for api call
	//console.log(City);
	const apiUrl = "https://api.openweathermap.org/data/2.5/weather?q="+ City + "&units=metric&APPID=a0562d44b2bd5392dc0f1ef5d322cc65";

	if (refreshWeather) {

	https.get( apiUrl, (response) => {
	//console.log( response.statusCode )
	
		if(response.statusCode == 200){
			//parse it into JSON, reformat to 1 decimal point
			response.on("data", (data) => {
					const weatherData = JSON.parse(data);
					let desc = weatherData.weather[0].description;
					let icon = weatherData.weather[0].icon;
					let iconURL = "https://openweathermap.org/img/wn/" + icon + "@2x.png";
					let cityTempVal = weatherData.main.temp;
					let cityTemp = Math.round(cityTempVal * 10) / 10 

			//display today's date
			let today = new Date();
			let dateFormat = {date: "short", day: "numeric", month:"long", year:"numeric"}
			today = today.toLocaleString("en-US", dateFormat);

			//update vals{}
			vals = {newItem: newActs,
					Today: today,
					City : City.toUpperCase(),
					Temp : cityTemp,
					Desc : desc,
					Icon : iconURL,
					savedItems: savedItems
			}

			//modify refreshWeather status and ship everything to front-end
			refreshWeather = false;
			console.log('API call req done')
			res.render('index.ejs', vals)

					});
		}
		//else if status code error on weather API call
		else {
			console.log("Error checking the weather");
			res.render('404.ejs')
		}
		
	})

	}
	// else render page without API call, to save time
	else res.render('index.ejs', vals)

});


app.post('/undo', (req, res)=>{

	//undo/delete last added

		let n = newActs.length;
		newActs = newActs.slice(0,n-1);
		vals.newItem = newActs
		//console.log(newActs);
		res.redirect('/')
})

app.post('/save', (req, res)=>{

	//recreate current date
	let today = new Date();
	let timeAsLink = '/' + today.getTime();
	let dateFormat = {date: "short", day: "numeric", month:"long", year:"numeric"}
	today = today.toLocaleString("en-US", dateFormat);

	//create object and save key info to db
	let batchVals = new allVals ({
					newActs : newActs,
					Today : today,
					username : username,
					link: timeAsLink
				})
		
	batchVals.save()

	//once saved clear arrays, renderedPage status to allow weather api refresh
	newActs = [];
	vals = {newItem: '',
			Today: '',
			City : '',
			Temp : '',
			Desc : '',
			Icon : ''};
	refreshWeather = true;

		res.redirect('/')
	
})

app.post('/', (req, res)=>{

	//if new city is entered, reformat first
	if(req.body.newCity){
		City = req.body.newCity;
		City = City.charAt(0).toUpperCase() + City.substring(1)
		refreshWeather = true
	};
	

	//only add item if input has a valid typed value
	if (req.body.activityInput !== undefined){
		var newAct = req.body.activityInput;
		newActs.push(newAct);
		vals.newItem = newActs
	}
		res.redirect('/')
});


//delete record and return to homepage
app.post('/remove', (req, res)=>{

	allVals.findByIdAndDelete(req.body.savedID, (err, docs)=>{
    if (err){
        console.log(err)
    }
    else console.log("Deleted : ", docs);
	});

	res.redirect('/')
})


// add route for each saved listing using the :param to search db for 'link'
app.get('/:p', (req, res)=>{
	
	let p = '/' + req.params.p
	//	console.log(p)
	
	//	pull from db and first verify link;
	allVals.find({link : '/'+req.params.p})
		.then((doc)=>{

			if(doc[0]){
				res.render('history.ejs', doc[0])
			}

			//else if link invalid render 404 page
			else res.render('404.ejs')

		})	

});


// add 404 page
app.use( (req, res)=> {
	res.status(404);
	res.render('404.ejs')
});

