var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {
      title: 'Guidémon — Gotta Guide \'em All',
      mapsKey: 'AIzaSyA5_3Cz9jzmlRsqt3S1IdvHaZzAJNnpDB8'
  });
});

module.exports = router;
