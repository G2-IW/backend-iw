/**
 * Created by grahamturk on 10/21/15.
 */

var express = require('express');
var router = express.Router();
var Home = require('../models/home');
var mongoose = require('mongoose');
var HomeEnergyModel = require('../models/energy-model');
var HomeRoofModel = require('../models/roof-model');
mongoose.Promise = require('bluebird');


router.use(function computeAddress(req, res, next) {
    req.params.address = '36 University Place, Princeton, NJ 08544';
    //req.params.address = maps.computeAddress(req.latitude, req.params.longitude);
    next();
});

// GET /homes?address=2454-Frist-Center
router.get('/', function(req, res, next) {
    var promise = Home.findOne({address: req.params.address}).exec();

    promise.then(function(home) {
        if (home == null) {
            throw new Error('Home does not exist');
        } else {
            res.status(200).json(home.formatHome());
        }
    }).catch(function(error) {
        res.status(404).json({error: error.message});
    });
});

// GET /homes/10
router.get('/:id', function(req, res, next) {
    var promise = Home.findOne({_id: req.params.id}).exec();

    promise.then(function(home) {
        if (home == null) {
            throw new Error('Home does not exist');
        } else {
            res.status(200).json(home.formatHome());
        }
    }).catch(function(error) {
        res.status(404).json({error: error.message});
    });
});

// POST /homes
router.post('/', function(req, res, next) {

    var requiredParams = ['address', 'energy_score', 'roof_score'];

    for (var key in requiredParams) {
        if (!req.body.hasOwnProperty(key)) {
            res.status(400).json({error: "Invalid request"});
            return;
        }
    }

    // Create home energy and roof models
    var homeEnergyModel = new HomeEnergyModel(req.body.energy_score);
    var homeRoofModel = new HomeRoofModel(req.body.roof_score);

    var home = new Home({
        address: req.body.address,
        energy_score: homeEnergyModel.getEnergyScore(),
        roof_score: homeRoofModel.getRoofScore()
    });

    home.save().then(function(home) {
        res.status(201).json(home.formatHome());
    }).catch(function(error) {
        res.status(500).json({error: 'Error saving home'});
    });
});

// PUT /homes/10
router.put('/:id', function(req, res, next) {
    var promise = Home.findOne({_id: req.params.id}).exec();

    var params = ['address', 'energy_score', 'roof_score'];

    promise.then(function(home) {
        for (var key in params) {
            if (req.body.hasOwnProperty(key)) {
                home.key = req.body.key;
            }
        }
        return home.save()
    }).then(function(updatedHome) {
        res.status(200).json(updatedHome.formatHome());
    }).catch(function(err) {
        res.status(400).json({error: error});
    });
});


module.exports = router;
