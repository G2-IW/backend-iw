/**
 * Created by grahamturk on 10/26/15.
 */

// var promise = require('bluebird');

var helper = require('../services/handle-units');
var config = require('../config');
var _ = require('underscore');

var MONTHS_IN_YEAR = 12;
var DAYS_IN_MONTH = 30;


var RecommendationEngine = function(home, solarLandscape, solarResourceData, solarPerformance, utilityRates,
                                    pvdaqMetadata, pvdaqSiteData, energyProfile, roofProfile) {
    this.home = home;

    this.recommendation = {};
    this.solarLandscape = solarLandscape;
    this.solarResourceData = solarResourceData;
    this.solarPerformance = solarPerformance;
    this.utilityRates = utilityRates;
    this.pvdaqMetadata = pvdaqMetadata;
    this.pvdaqSiteData = pvdaqSiteData;

    this.energyProfile = energyProfile;
    this.roofProfile = roofProfile;


    // mechanism to implement synchronous execution
    // barrier must be fulfilled by a promise


    var arraySize;
    arraySize = this.calculateArraySizeMonthly();

    var arrayCapacity = this.calculateArrayCapacity(arraySize);
    var arrayCost = this.calculateArrayCost(arrayCapacity);

    this.doCostCalculation(arrayCost);

    /*
    // Use PVWatts to calculate AC output of array in watts
    if (config.flags.startFromCapacity) {

        var avgACOutput;
        var error;
        do {
            error = Math.abs(avgACOutput - this.homeEnergyModel.totalConsumption) /
                    this.homeEnergyModel.totalConsumption;

        } while (error > config.flags.threshold);


    }
    */
};

function computeAveragePower(pvdaqSites) {
    var size = _.size(pvdaqSites);
    var powerPerAreas = 0;
    _.each(pvdaqSites, function(site) {
        powerPerAreas += site.site_power / site.site_area;
    });
    return powerPerAreas / size;
}

RecommendationEngine.prototype.getRecommendation = function() {
    return this.recommendation;
};

/* Separate methods for these calculations in case they
   become more complicated */
RecommendationEngine.prototype.calculateArraySizeMonthly = function() {
    var totalConsumption = this.energyProfile.monthlyConsumption;

    // arraySize in squared meters
    var arraySize = totalConsumption / (this.solarResourceData.avg_dni.annual * DAYS_IN_MONTH);

    // Max array size calculated with roof dimensions
    var maxArraySize = this.roofProfile.area.units == "sqm" ?
        this.roofProfile.area.value : helper.convertUnits("sqft", "sqm", this.roofProfile.area.value);

    if (arraySize < maxArraySize) {
        this.recommendation.exceedsMaxSize = true;
        this.recommendation.arraySize = maxArraySize;
        return maxArraySize;
    }

    this.recommendation.arraySize = arraySize;
    return arraySize;
};

RecommendationEngine.prototype.calculateArrayCapacity = function(arraySize) {
    // TODO: differentiate between peak and average
    var arrayCapacity = arraySize * computeAveragePower(this.pvdaqMetadata);
    this.recommendation.arrayCapacity = arrayCapacity;
    return arrayCapacity;
};

RecommendationEngine.prototype.calculateArrayCost = function(arrayCapacity) {
    var arrayCost = arrayCapacity * this.solarLandscape.avg_cost_pw;
    this.recommendation.arrayCost = arrayCost;
    return arrayCost;
};

RecommendationEngine.prototype.doCostCalculation = function(arrayCost) {
    this.recommendation.timetoPayOff = arrayCost / this.energyProfile.paymentPerMonth;

    // TODO: add APR to calculation

    var monthlyBill = this.energyProfile.hasOwnProperty('monthlyCost') ?
                    this.energyProfile.monthlyCost : this.energyProfile.monthlyConsumption * this.utilityRates.residential;
    var tenYearUtilityCost = this.calculateFutureCost(10, monthlyBill);
    var twentyYearUtilityCost = this.calculateFutureCost(20, monthlyBill);

    this.recommendation.tenYearSavings = tenYearUtilityCost - arrayCost;

    // this.recommendation.twentyYearSavings = twentyYearUtilityCost - arrayCost;
};

// timespan in years
// TODO: build in more sophisticated future assessment
RecommendationEngine.prototype.calculateFutureCost = function(timespan, monthlyBill) {
    return monthlyBill * Math.pow(config.flags.inflation, timespan) * timespan * MONTHS_IN_YEAR;
};

RecommendationEngine.prototype.getRecommendation = function() {
    return this.recommendation;
};

module.exports = RecommendationEngine;
