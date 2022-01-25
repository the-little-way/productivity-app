const express = require ('express');
const app = express();
const bodyParser = require('body-parser');
const ejs = require('ejs');
const https = require('https');
const cors = require('cors');

const {mongoose} = require('./db.js');
const {allVals} = require('./models/allVals.js')
const {allUsers} = require('./models/allUsers.js')
const refreshWeather = require ('./refreshWeather.js')

app.use(bodyParser.urlencoded({extended:true}));

app.set('view engine', 'ejs');

app.use(express.static('assets'));

//scroll to bottom for port


//temp storage
// pull info from db
var savedItems = [];

// fill using current session
var newActs = [];

//all the data to be shipped to front-end
var vals = {newItem: '',
			Today: '',
			City : '',
			Temp : '',
			Desc : '',
			Icon : '',
			savedItems: ''
		};
		
let username = "";
let updateWeather = true;
let City = "Accra"; //default city


app.route('/login')
	.get((req, res)=>{
		res.render('login.ejs')
	})
	.post((req, res)=>{
		let user = req.body.username;
		let pass = req.body.password;
		let savedPass = '';

		//check the allUsers db for matching username then compare password (not hashed for now)
		allUsers.find( {username:user}, (err, docs)=>{
			if(!err && docs[0] != null ){
				//console.log(docs)
				savedPass = docs[0].password;
				//console.log(pass)
				if(savedPass == pass){
					username = user;
					res.redirect('/')
				}
				else res.redirect('/login')
			}
			else {console.log('user validation error: ' + err);
				res.redirect('/login')
			}
		})
	})

app.route('/register')
	.post((req, res)=>{
		let userNew = req.body.newuser;
		let passNew = req.body.newpass;

		//create new modle and check if username already exists before saving it
		allUsers.find({username:userNew}, (err, docs)=>{
			if (!err && docs[0] != null){
				//if a document is returned it means a user exists so no registration is allowed
				res.send('Sorry username exists. Please try a different name') //to-do: replace with better res.send
			}
			else if (!err && docs[0] == null){
				//it means no such user exists so save this new user
				let userNewData = new allUsers({
					username : userNew,
					password : passNew
				})
				userNewData.save();
				res.redirect('/login')
			}
			else {console.log(err);
				res.redirect('/login')
			}
		})
	})

app.route('/')
	.get((req,res)=>{


			//display today's date
			let today = new Date();
			let dateFormat = {date: "short", day: "numeric", month:"long", year:"numeric"}
			today = today.toLocaleString("en-US", dateFormat);

			//first check if valid user is logged in
			allUsers.find( {username : username}, (err, docs)=>{
				if(!err && docs[0] != null ){
					//means userfound, now load user's lists from allVals db
					allVals.find( {username : username} )
					.then((doc)=>{
						savedItems=doc
					});
					//console.log(savedItems);
					//href value = savedItems.link='/...'

					//use openweather API to get current weather
					// check weather once on the first render and then manually next time instead of on every page refresh
					
					//change City if user desires else use default for api call
					if (updateWeather){

						const promiseToken = refreshWeather(City).then( (ans)=>{
						//console.log('returned from refreshWeather:' + ans.City);
						
						//update vals{} including returned vals from refreshWeather()
						vals = {newItem: newActs,
								Today: today,
								City : ans.City,
								Temp : ans.Temp,
								Desc : ans.Desc,
								Icon : ans.iconURL,
								savedItems: savedItems
						}
						updateWeather = ans.updateWeather;
						//Ship everything to front-end
						res.render('index.ejs', vals)	
						})
					}

					//skiped weather refresh
					else res.render('index.ejs', vals)
					
					
					
				}

				//user not logged in so return to login page
				else res.redirect('/login')
			})

	})
	.post((req, res)=>{

		//if new city is entered, reformat first
		if(req.body.newCity){
			City = req.body.newCity;
			City = City.charAt(0).toUpperCase() + City.substring(1)
			updateWeather = true
		};
		

		//only add item if input has a valid typed value
		if (req.body.activityInput !== undefined){
			var newAct = req.body.activityInput;
			newActs.push(newAct);
			vals.newItem = newActs
		}

		res.redirect('/')
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
	
	//only save to db if valid user
	//allUsers.find({username:userNew}, (err, docs)=>{

	//if (!err && docs[0] != null){

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
				Icon : ''
			};
		updateWeather = true;

			res.redirect('/')
	//}
	//else res.redirect('/login')
	//})
})





//delete record and return to homepage
app.post('/remove', (req, res)=>{

	allVals.findByIdAndDelete(req.body.savedID, (err, docs)=>{
    		if (err){
        		console.log(err)
    		}
    		else console.log("Deleted : ", docs);
	});
	
	//clear last item in savedItems and then redirect
	vals.savedItems = vals.savedItems.splice(0, vals.savedItems.length - 1)
	res.redirect('/')
})

app.post('/logout', (req, res)=>{
	//reset user and return to login page
	username ="";
	res.redirect('/login')
})

//add route for each saved listing using the :param to search db for 'link'
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

//port
let port = process.env.PROT;
if (port== null || port ==""){
	port = 3000;
}
app.listen(port);
