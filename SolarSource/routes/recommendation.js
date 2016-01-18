/**
 * Created by grahamturk on 10/28/15.
 */

var express = require('express'),
    router = express.Router(),
    NullDocumentError = require('../services/NullDocumentError'),
    RecommendationEngine = require('../recommendation-engine/recommendation-engine'),
    mongoose = require('mongoose'),
    _ = require('underscore');

var config = require('../config');
var helper = require('../services/handle-units');
var nrel = require('../services/nrel');
var wattvision = require('../services/wattvision');
var HomeEnergyModel = require('../models/energy-model');
var HomeRoofModel = require('../models/roof-model');

var Home = require('../models/home');

var bluebird = require('bluebird');

mongoose.Promise = require('bluebird');

// recommendation engine object
var recommendationEngine;

var ObjectId = mongoose.Types.ObjectId;


/**
 * @api {get} /recs/:id Request recommendation for home
 * @apiName GetRec
 * @apiGroup Recommendation
 *
 * @apiDescription This method can only be called for a home
 *  that has been created with a successful POST /homes request.
 *  Returned object has the fields described below.
 *
 *
 * @apiParam {Number} id Home's unique database id
 *
 * @apiSuccess {Boolean} exceedsMaxSize Does 100% coverage exceed the maximum roof area?
 * @apiSuccess {Number} arraySize Size of the array (squared meters)
 * @apiSuccess {Number} arrayCapacity Peak power output of total array (watts)
 * @apiSuccess {Number} arrayCost Full upfront cost of array
 * @apiSuccess {Number} timeToPayOff Number of months to pay off array in full based on user-specified monthly payment
 * @apiSuccess {Number} tenYearSavings Savings in dollars after 10 years of array use
 * @apiSuccess {Number} twentyYearSavings Savings in dollars after 20 years of array use
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "exceedsMaxSize": "true",
 *       "arraySize": "20",
 *       "arrayCapacity": "5000",
 *       "arrayCost": "15000",
 *       "timeToPayOff": "60",
 *       "tenYearSavings": "2000",
 *       "twentyYearSavings": "5000"
 *     }
 *
 * @apiUse HomeNotFoundError
 *
 * @apiExample {curl} Example usage:
 *      curl -i http://localhost:8080/recs/240302030400304
 *
 *
 */
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

        /* TODO: Check if recommendation is already there */
        if (Object.keys(home.recommendation).length != 0) {
            //res.status(200).json(home.recommendation);
            //return;
        }

        this.home = home;

        if (home.energy.useWattvision) {
            var wattvision = home.energy.wattvision;

            return wattvision.getWattvisionData(wattvision.sensor_id, wattvision.api_id, wattvision.api_key,
                config.wattvision.type, wattvision.start_time, wattvision.end_time);
        }

        return bluebird.resolve(null);

    }).then(function (wattvisionData) {

        // wattvision data may be null
        var argData = wattvisionData ? wattvisionData.data : null;
        this.homeEnergyModel = new HomeEnergyModel(this.home.energy, argData);
        this.homeRoofModel = new HomeRoofModel(this.home.roof);

        this.roofProfile = this.homeRoofModel.getRoofProfile();
        this.energyProfile = this.homeEnergyModel.getEnergyProfile();

        return nrel.getSolarResourceData(this.home.lat, this.home.lon);

    }).then(function(resource) {
        this.solarResourceData = resource.body.outputs;

        return helper.getZipCode(this.home.lat, this.home.lon);

    }).then(function(zipcode) {
        return nrel.getSummaries(zipcode);

    }).then(function(summaries) {

        if (summaries.body.result.avg_cost_pw == null) {
            return nrel.getSummariesDefault();
        }
        // TODO: figure out if need promise here
        return bluebird.resolve(summaries);

    }).then(function(summaries) {
        this.solarLandscape = summaries.body.result;
        return nrel.getUtilityRates(this.home.lat, this.home.lon);

    }).then(function(rates) {
        this.utilityRates = rates.body.outputs;

        // TODO: change to closest station via GPS
        return nrel.getPVDAQMetadata(config.nrel.pvdaq.siteIds[0]);

    }).then(function (pvdaqMetadata) {
       //  console.log(pvdaqMetadata.body.outputs);
        this.pvdaqMetadata = [];
        this.pvdaqMetadata[0] = pvdaqMetadata.body.outputs[0];
        return nrel.getPVDAQMetadata(config.nrel.pvdaq.siteIds[1]);

    }).then(function(pvdaqMetadata) {
       // console.log(pvdaqMetadata.body.outputs);

        this.pvdaqMetadata[1] = pvdaqMetadata.body.outputs[0];

        console.log('META0:' + this.pvdaqMetadata[0]);
        console.log('META1:' + this.pvdaqMetadata[1]);

        return nrel.getPVDAQSiteData(config.nrel.pvdaq.siteIds[0]);

    }).then(function(pvdaqSiteData) {
        var dataEntries = _.size(pvdaqSiteData.body.outputs);

        this.pvdaqSiteData = [];
        this.pvdaqSiteData[0] = pvdaqSiteData.body.outputs.slice(1, dataEntries - 1);

        return nrel.getPVDAQSiteData(config.nrel.pvdaq.siteIds[1]);

    }).then(function(pvdaqSiteData) {
        var dataEntries = _.size(pvdaqSiteData.body.outputs);
        this.pvdaqSiteData[1] = pvdaqSiteData.body.outputs.slice(1, dataEntries - 1);

        recommendationEngine = new RecommendationEngine(this.home, this.solarLandscape, this.solarResourceData,
            this.utilityRates, this.pvdaqMetadata, this.pvdaqSiteData, this.energyProfile, this.roofProfile);

        this.recommendation = {};
        this.recommendation.units = {
            exceedsMaxSize: 'boolean',
            coverage: 'percent',
            arraySize: 'square meters',
            arrayCapacity: 'kilowatts',
            arrayCost: 'USD',
            monthlyPayment: 'USD',
            twentyYearUtilityCost: 'USD',
            twentyYearSavings: 'USD',
            averageAnnualSavings: 'USD'
        };
        this.recommendation.values = recommendationEngine.getRecommendation();

        for (var key in this.recommendation.values) {
            if (this.recommendation.values.hasOwnProperty(key) &&
                this.home.recommendation.hasOwnProperty(key)) {
                this.home.recommendation.key = this.recommendation.values.key;
            }
        }

        return this.home.save();

    }).then(function(savedHome) {
        res.status(200).json(this.recommendation);

    }).catch(NullDocumentError, function(err) {
        res.status(400).json({error: err.message});
    }).catch(function(err) {
        res.status(500).json({error: err.message});
    })
});


module.exports = router;

