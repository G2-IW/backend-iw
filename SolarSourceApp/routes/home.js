/**
 * Created by grahamturk on 10/21/15.
 */

var express = require('express');
var router = express.Router();
var Home = require('../models/home');

router.use(function computeAddress(req, res, next) {
    req.params.address = '36 University Place, Princeton, NJ 08544';
    //req.params.address = maps.computeAddress(req.latitude, req.params.longitude);
    next();
});

router.get('/', function(req, res, next) {
    Home.findOne({address: req.params.address}, function(err, home) {
        if (err) res.status(404).send("There was an error");
        else res.send(home.formatHome());
    });
});

router.get('/:id', function(req, res, next) {
    console.log('request id: ' + req.params.id);
    Home.findOne({_id: req.params.id}, function(err, home) {
        if (err) res.status(404).send("Error not found");
        else res.send(home.formatHome());
    });
});

router.post('/', function(req, res, next) {
    var home = new Home({
        address: req.body.address,
        energy_score: req.body.energy_score,
        roof_score: req.body.roof_score
    });
    home.save(function(err) {
        if (err) {
            console.log("error creating home model");
        }
    });
});

router.put('/', function(req, res, next) {

});


module.exports = router;
