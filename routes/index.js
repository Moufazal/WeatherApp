var express = require('express');
var router = express.Router();
// import request module
var request = require('request');
// import bdd models
cityModel = require('../models/city');
userModel = require('../models/user');

const {apiKey} = require('../config/config');

// var to check if Weather is found with the city name entered by the user (0 = Not found)
var villeTrouvee = -1;


/* GET / Home Page */
router.get('/', function(req, res, next) {
  if(req.session.statut == "connected"){
    userModel.findOne({email: req.session.email},
      async function(err, user){
        await cityModel.find({_id: user.city},
          function(err, weatherData){
            res.render('index', {weatherData, villeTrouvee});
          }
        )
      })
  }else{
    res.redirect('/signin');
  }
});


/* POST / return home page (post request to add city). */
router.post('/', async function(req, res, next) {

  // Search in DB if the city already exists or not
  var cityAlreadyExist;
  req.session.cityName = req.body.cityName;

  var userFound = await userModel.findOne({email: req.session.email});
  var cityFound = await cityModel.find({_id: userFound.city});

  if (cityFound.length > 0){
    cityFound.forEach(element => {
      if(element.name == req.session.cityName){
        cityAlreadyExist = 'exist';
      }
    });
  }

  if (cityAlreadyExist != 'exist' && req.session.cityName != ""){
    request(`http://api.openweathermap.org/data/2.5/weather?q=${req.session.cityName}&lang=fr&units=metric&APPID=${apiKey}`, function(error, response, body){
      var getBody = JSON.parse(body);

      if(getBody.cod == "200"){
        villeTrouvee = 1;
        req.session.name = getBody.name;
        req.session.desc = getBody.weather[0].description;
        req.session.img = getBody.weather[0].icon;
        req.session.temp_min = getBody.main.temp_min;
        req.session.temp_max = getBody.main.temp_max;
        req.session.latitude = getBody.coord.lat;
        req.session.longitude = getBody.coord.lon;

            var newCity = new cityModel({
              name: req.session.name,
              desc: req.session.desc,
              img: req.session.img,
              temp_min: req.session.temp_min,
              temp_max: req.session.temp_max,
              latitude: req.session.latitude,
              longitude: req.session.longitude,
            });
           newCity.save(
              (err, weatherData) => {
                userModel.updateOne({email: req.session.email},{$push: {city:weatherData._id}},
                  function(err, userUpdated){
                    res.redirect('/');
                  })
              }
            );

      } else{
        villeTrouvee = 0;
        res.redirect('/');
      }
    })
  } else{
    if (req.body.cityName == ""){
      villeTrouvee = 0;
    } else{
      villeTrouvee = 1;
    }
    res.redirect('/');
  }

});

/* GET /signin: return signin page. */
router.get('/signin', function(req, res, next) {
  res.render('signin', {});
});

/* POST /signin: return index page if ok, else sigin page again. */
router.post('/signin', function(req, res, next) {
  req.session.email = req.body.email;
  req.session.pwd = req.body.password;

  userModel.findOne({email: req.session.email},
    function(err, user){
      if (err){
        res.render('signin', {});
      } else{
        if(user == null){
          res.render('signin', {});
        } else if(user.email == req.session.email && user.password == req.session.pwd){
          req.session.statut = "connected";
          res.redirect('/');
        } else{
          res.render('signin', {});
        }
      }
    }
  )
});

/* GET /signup: return signUp page. */
router.get('/signup', function(req, res, next) {
  res.render('signup', {});
});

/* POST /signup return signin page */
router.post('/signup', function(req, res, next) {
  req.session.username = req.body.username;
  req.session.email = req.body.email;
  req.session.pwd = req.body.pwd;
  if(req.session.username !="" && req.session.email !="" && req.session.pwd !=""){
    var newUser = new userModel({
      username: req.session.username,
      email: req.session.email,
      password: req.session.pwd,
    })
    newUser.save(
      (err, user) => {
      }
    )
    res.render('signin');
  }else{
    res.render('signup');
  }
});


router.get('/logout', function(req, res){
  req.session.destroy(function(err) {
    res.redirect('/');
  })
})




/* GET /deleteCity: return home page (delete request to delete city informations). */
router.get('/deleteCity', async function(req, res, next) {
  var cityDelete = await cityModel.deleteOne({_id: req.query.id});
  res.redirect('/');
});


/* GET /updateCity: return home page (update request to refresh city informations). */
router.get('/updateCities', async function(req, res, next) {
  var citiesFound = await cityModel.find();

  citiesFound.forEach(element => {
    var weatherInfos = request(`http://api.openweathermap.org/data/2.5/weather?q=${element.name}&lang=fr&units=metric&APPID=${apiKey}`, function(error,response,body){
      var getBody = JSON.parse(body);

      cityModel.updateOne(
        {_id: element._id},
        {name: element.name,
        desc: getBody.weather[0].description,
        img: getBody.weather[0].icon,
        temp_min: getBody.main.temp_min,
        temp_max: getBody.main.temp_max,
        latitude: getBody.coord.lat,
        longitude: getBody.coord.lon,
        },
      );
    });
  });
  res.redirect('/');
});

module.exports = router;
