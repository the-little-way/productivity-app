const https = require('https');


function refreshWeather (arg) {
	
	let City = arg;
	const apiUrl = "https://api.openweathermap.org/data/2.5/weather?q="+ City + "&units=metric&APPID=a0562d44b2bd5392dc0f1ef5d322cc65";
	let ans = "";

	const promiseToken = new Promise((resolve, reject)=>{



	https.get( apiUrl, (response) => {
		console.log( response.statusCode )
		console.log('refreshing...')

		if(response.statusCode == 200){

			//parse it into JSON, reformat temp to 1 decimal point
			response.on("data", (data) => {
					const weatherData = JSON.parse(data);
					let desc = weatherData.weather[0].description;
					let icon = weatherData.weather[0].icon;
					let iconURL = "https://openweathermap.org/img/wn/" + icon + "@2x.png";
					let cityTempVal = weatherData.main.temp;
					let cityTemp = Math.round(cityTempVal * 10) / 10 

					ans = {
							City : City.toUpperCase(),
							Temp : cityTemp,
							Desc : desc,
							Icon : iconURL,
							updateWeather : false
					}
					
					//remodify refreshWeather status and ship everything to front-end
					;
					console.log('Weather API call req done.')// + JSON.stringify(ans))
			
			})
			response.on('end', ()=>{resolve(ans)})
		}
		//else if status code error on weather API call
		else {
			console.log("Error checking the weather");
			//res.render('404.ejs')
		}
		
	})
	});
	return promiseToken;
	}


module.exports = refreshWeather

