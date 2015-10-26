/**
 * Created by grahamturk on 10/26/15.
 */

var nrel = require('../services/nrel');
var helper = require('../services/handle-units');

var Engine = function(home) {
    this.home = home;

    this.recommendation = {};
    this.solarLandscape = {};

    this.solarResourceData = nrel.getSolarResourceData(this.lat, this.lon).outputs;
    this.solarPerformance = nrel.getPVWatts(this.home.capacity,
        this.home.arrayType, this.home.tiltAngle, this.home.azimuthAngle, this.home.lat, this.home.lon).outputs;

    var zipCode = helper.getZipCode(this.home.lat, this.home.lon);
    this.solarLandscape = nrel.getSummaries(zipCode).result;

    this.utilityRates = nrel.getUtilityRates(this.home.lat, this.home.lon).outputs;
};

Engine.prototype.getRecommendation = function() {
    return this.recommendation;
};


module.exports = Engine;
