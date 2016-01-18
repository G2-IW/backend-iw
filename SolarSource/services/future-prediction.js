/**
 * Created by grahamturk on 12/13/15.
 */

var mongoose = require('mongoose'),
    _ = require('underscore');

var express = require('express'),
    router = express.Router();

var config = require('../config'),
    helper = require('../services/handle-units'),
    nrel = require('../services/nrel');

var HomeEnergyModel = require('../models/energy-model'),
    HomeRoofModel = require('../models/roof-model'),
    NullDocumentError = require('NullDocumentError');

var Home = require('../models/home');

var bluebird = require('bluebird');

mongoose.Promise = require('bluebird');

var ObjectId = mongoose.Types.ObjectId;


router.get('/:id', function(req, res, next) {

    if (!ObjectId.isValid(req.params.id)) {
        res.status(400).json({error: 'Invalid id'});
        return;
    }

    var promise = Home.findById(req.params.id).exec();

    promise.bind(this).then(function(home) {
        if (home == null) {
            throw new NullDocumentError('Home does not exist');
        }

        if (Object.keys(home.performance).length != 0) {
            res.status(200).json(home.performance);
            return;
        }

        this.home = home;

        this.homeEnergyModel = new HomeEnergyModel(this.home.energy, null);
        this.homeRoofModel = new HomeRoofModel(this.home.roof);

        this.roofProfile = this.homeRoofModel.getRoofProfile();
        this.energyProfile = this.homeEnergyModel.getEnergyProfile();

        return nrel.getPVWatts(this.energyProfile.systemCapacity, this.roofProfile.arrayType, this.roofProfile.tilt,
            this.roofProfile.azimuth, this.home.lat, this.home.lon);

    }).then(function(solarPerformance) {
        this.solarPerformance = solarPerformance.body.outputs;

        // TODO: Check if need to set keys explicitly
        this.home.performance = this.performance;

        this.home.save();

    }).then(function(savedHome) {
        res.status(200).json(this.solarPerformance);

    }).catch(NullDocumentError, function(err) {
        res.status(400).json({error: err.message});
    }).catch(function(err) {
        res.status(500).json({error: err.message});
    })

});

