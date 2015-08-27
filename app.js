var express = require('express');
var app = express();
var path = require("path");

var bodyParser = require("body-parser");
app.use(bodyParser.json())

app.use("/public", express.static(path.join(__dirname + "/public")));
app.set("view engine", "hbs");

var busStopsController = require("./controllers/busStops");

app.get("/", function(req, res){
  res.render("index", {})
});
app.get("/faq", function(req, res){
  res.render("faq", {})
});
app.get("/about", function(req, res){
  res.render("about", {})
});

app.use("/", busStopsController);

var request = require("request");

///security configuration for api keys////
var configuration = require("./config/keys.json");
var wmta_key = configuration.wmta.api_key;
var darkSky_key = configuration.darkSky.api_key;
app.listen("3000", function(){
  console.log("big Burrito is SAUCY!")
});

/////////////////////NextBus API call///////////////////////
var apiKey = wmta_key;
var darkSkyApiKey = darkSky_key;
var latitude;
var longitude;
function options(id){
  return  {
  url: 'https://api.wmata.com/NextBusService.svc/json/jPredictions?StopID=' + id + '&api_key='+ apiKey
  }
};
// Based on Stop ID user value, find matching Stop ID in database
// With stored matched ID, return latitude
// With stored matched ID, return longitude
function weather(lat,lon){
  return {
  url: 'https://api.forecast.io/forecast/' + darkSkyApiKey + '/' + latitude + ',' + longitude
  }
};
///////////////////////////////////////////////////////////
var getBusInfo = {
  busAPIInfo: "",
  rez: "",
  sendJSON: function(){
    this.rez.json(this.busAPIInfo)
  }
}
app.get("/busstop/:id", function(req, nodeResponse){
  request(options(req.params.id),function (error, response, body) {
    if (!error && response.statusCode == 200) {
      getBusInfo.rez = nodeResponse; // nodeResponse will become the response
      getBusInfo.busAPIInfo = JSON.parse(body);
      getBusInfo.sendJSON();
    }
  });//end of request module
});
var getWeatherInfo = {  //insert values into object
  weatherInfo:"",
  rez:"",
  sendJSON: function(){
    this.rez.json(this.weatherInfo);
  }
}
app.get("/weather/:lat/:lon",function(req,nodeResponse){
  console.log(req.params.lat);
  console.log(req.params.lon);
   latitude = req.params.lat;
   longitude = req.params.lon;
  request(weather(latitude,longitude),function(error,response,body){  //make http call to weather API
    if (!error && response.statusCode == 200){
      getWeatherInfo.rez = nodeResponse;
      getWeatherInfo.weatherInfo = JSON.parse(body);
      getWeatherInfo.sendJSON();  //return response object "getWeatherinfo" to client side
    }
  });
});//end of app.get("/weather”)
