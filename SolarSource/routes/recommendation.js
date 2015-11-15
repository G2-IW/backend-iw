/**
 * Created by grahamturk on 10/28/15.
 */

var express = require('express'),
    router = express.Router(),
    NullDocumentError = require('../services/NullDocumentError'),
    RecommendationEngine = require('../recommendation-engine/recommendation-engine'),
    mongoose = require('mongoose');

var helper = require('../services/handle-units');
var nrel = require('../services/nrel');
var HomeEnergyModel = require('../models/energy-model');
var HomeRoofModel = require('../models/roof-model');

var Home = require('../models/home');

mongoose.Promise = require('bluebird');

// recommendation engine object
var recommendationEngine;


var ObjectId = mongoose.Types.ObjectId;

router.get('/:id', function(req, res, next) {

    if (!ObjectId.isValid(req.params.id)) {
        res.status(400).json({error: 'Invalid id'});
        return;
    }

    var promise = Home.findById(req.params.id).exec();

    promise.bind(this).then(function(home) {
        if (home == null) {
            console.log('Inside null home');
            throw new NullDocumentError('Home does not exist');
        }

        this.home = home;

        this.homeEnergyModel = new HomeEnergyModel(home.energy);
        this.homeRoofModel = new HomeRoofModel(home.roof);

        this.roofProfile = this.homeRoofModel.getRoofProfile();
        this.energyProfile = this.homeEnergyModel.getEnergyProfile();

        return nrel.getSolarResourceData(this.home.lat, this.home.lon)

    }).then(function(resource) {
        this.solarResourceData = resource.body.outputs;

        return nrel.getPVWatts(this.energyProfile.systemCapacity, this.roofProfile.arrayType, this.roofProfile.tilt,
            this.roofProfile.azimuth, this.home.lat, this.home.lon);

    }).then(function(resource) {
        this.solarPerformance = resource.body.outputs;
        return helper.getZipCode(this.home.lat, this.home.lon);

    }).then(function(zipcode) {
        return nrel.getSummaries(zipcode);

    }).then(function(summaries) {

        this.solarLandscape = summaries.body.result;
        return nrel.getUtilityRates(this.home.lat, this.home.lon);

    }).then(function(rates) {
        this.utilityRates = rates.body.outputs;

        recommendationEngine = new RecommendationEngine(this.home, this.solarLandscape, this.solarResourceData,
            this.solarPerformance, this.utilityRates, this.energyProfile, this.roofProfile);
        res.status(200).json(recommendationEngine.getRecommendation());

    }).catch(NullDocumentError, function(err) {
        res.status(400).json({error: err.message});
    }).catch(function(err) {
        res.status(500).json({error: err.message});
    })
});


module.exports = router;

