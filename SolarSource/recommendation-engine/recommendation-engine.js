/**
 * Created by grahamturk on 10/26/15.
 */

// var promise = require('bluebird');
var helper = require('../services/handle-units');
var config = require('../config');

var MONTHS_IN_YEAR = 12;
var DAYS_IN_MONTH = 30;


var RecommendationEngine = function(home, solarLandscape, solarResourceData, solarPerformance, utilityRates, energyProfile, roofProfile) {
    this.home = home;

    this.recommendation = {};
    this.solarLandscape = solarLandscape;
    this.solarResourceData = solarResourceData;
    this.solarPerformance = solarPerformance;
    this.utilityRates = utilityRates;

    this.energyProfile = energyProfile;
    this.roofProfile = roofProfile;


    // mechanism to implement synchronous execution
    // barrier must be fulfilled by a promise


    var arraySize;
    if (config.flags.energy == "wattvision") {
        arraySize = this.calculateArraySizeWattvision();
    } else if (config.flags.energy == "monthly") {
        arraySize = this.calculateArraySizeMonthly();
    }

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

RecommendationEngine.prototype.getRecommendation = function() {
    return this.recommendation;
};

/* Separate methods for these calculations in case they
   become more complicated */
// TODO: build support for units other than kwh
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

// TODO: write this method
RecommendationEngine.prototype.calculateArraySizeWattvision = function() {
    return 10;
};

RecommendationEngine.prototype.calculateArrayCapacity = function(arraySize) {
    // TODO: differentiate between peak and average
    var arrayCapacity = arraySize * (config.flags.peak);
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

    var monthlyBill = this.roofProfile.hasOwnProperty('monthlyConsumption') ?
                    this.energyProfile.monthlyCost : this.energyProfile.monthlyConsumption * this.utilityRates.residential;
    var tenYearUtilityCost = this.calculateFutureCost(10, monthlyBill);
    var twentyYearUtilityCost = this.calculateFutureCost(20, monthlyBill);

    this.recommendation.tenYearSavings =  arrayCost - tenYearUtilityCost;

    this.recommendation.twentyYearSavings = arrayCost - twentyYearUtilityCost;
};

// timespan in years
RecommendationEngine.prototype.calculateFutureCost = function(timespan, monthlyBill) {
    return monthlyBill * config.flags.inflation * timespan * MONTHS_IN_YEAR;
};

RecommendationEngine.prototype.getRecommendation = function() {
    return this.recommendation;
};

module.exports = RecommendationEngine;
