/**
 * Created by grahamturk on 10/26/15.
 */

// var promise = require('bluebird');

var helper = require('../services/handle-units');
var config = require('../config');
var _ = require('underscore');

var MONTHS_IN_YEAR = 12;
var DAYS_IN_MONTH = 30;
var CORRECTING_FACTOR = 2.4;


var RecommendationEngine = function(home, solarLandscape, solarResourceData, utilityRates,
                                    pvdaqMetadata, pvdaqSiteData, energyProfile, roofProfile) {
    this.home = home;

    this.recommendation = {};
    this.solarLandscape = solarLandscape;
    this.solarResourceData = solarResourceData;
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
    console.log('size:' + size);
    var powerPerAreas = 0;
    for (var i = 0; i < size; i++) {
        var site = pvdaqSites[i];
        console.log('site power:' + site.site_power);
        powerPerAreas += site.site_power / site.site_area;
    }
    console.log('PPA' + powerPerAreas);
    return powerPerAreas / size;
}

RecommendationEngine.prototype.getRecommendation = function() {
    return this.recommendation;
};

/* Separate methods for these calculations in case they
   become more complicated */
RecommendationEngine.prototype.calculateArraySizeMonthly = function() {
    console.log('util rates:' + this.utilityRates.residential);
    var totalConsumption = this.energyProfile.monthlyCost / this.utilityRates.residential;

    // arraySize in squared meters
    console.log('tot cons:' + totalConsumption);
    console.log('dni: ' + this.solarResourceData.avg_dni.annual);
    var arraySize = totalConsumption / (this.solarResourceData.avg_dni.annual * 30 / CORRECTING_FACTOR);

    console.log('ARRAY_SIZE:' + arraySize);

    // Max array size calculated with roof dimensions
    var maxArraySize = this.roofProfile.usableArea.units == "sqm" ?
        this.roofProfile.usableArea.value : helper.convertUnits("sqft", "sqm", this.roofProfile.usableArea.value);

    // WATCH OUT FOR THIS
    if (arraySize > maxArraySize) {
        this.recommendation.exceedsMaxSize = true;
        this.recommendation.coverage = maxArraySize / arraySize;
        this.recommendation.arraySize = maxArraySize;
        // TODO: make fractional estimate
        return maxArraySize;
    }

    this.recommendation.exceedsMaxSize = false;
    this.recommendation.coverage = 100;
    this.recommendation.arraySize = arraySize;
    return arraySize;
};

RecommendationEngine.prototype.calculateArrayCapacity = function(arraySize) {
    // TODO: differentiate between peak and average
    console.log('AVG POWER: ' + computeAveragePower(this.pvdaqMetadata));
    var arrayCapacity = arraySize * computeAveragePower(this.pvdaqMetadata);
    this.recommendation.arrayCapacity = arrayCapacity / 1000;
    console.log('ARRAY CAPACITY: ' + arrayCapacity / 1000);
    return arrayCapacity;
};

RecommendationEngine.prototype.calculateArrayCost = function(arrayCapacity) {
    var totalCost = arrayCapacity * this.solarLandscape.avg_cost_pw;

    console.log('TOTAL COST:' + totalCost);

    var monthlyInterest = config.flags.annualInterest / 12;
    var numPeriods = config.flags.loanYears * MONTHS_IN_YEAR;

    var loanPayment = (monthlyInterest * totalCost) / (1 - Math.pow((1 + monthlyInterest), -numPeriods));

    var arrayCost = loanPayment * config.flags.loanYears * MONTHS_IN_YEAR;

    console.log('ARRAY COST: ' + arrayCost);

    this.recommendation.arrayCost = arrayCost;
    this.recommendation.monthlyPayment = arrayCost / (20 * MONTHS_IN_YEAR);
    return arrayCost;
};

RecommendationEngine.prototype.doCostCalculation = function(arrayCost) {
    // var financeType = home.financeType;

    // if (financeType ==)

    // this.recommendation.timetoPayOff = arrayCost / this.energyProfile.paymentPerMonth;

    // TODO: add APR to calculation < already in it
    // TODO: this only works if the array is large enough to cover all of generation - already done
    /* Use SolarCity MyPower as a baseline, also have fixed rate */

    var monthlyBill = this.energyProfile.hasOwnProperty('monthlyCost') ?
                    this.energyProfile.monthlyCost : this.energyProfile.monthlyConsumption * this.utilityRates.residential;

    console.log(monthlyBill);

    var tenYearUtilityCost = this.calculateFutureCost(10, monthlyBill);
    var twentyYearUtilityCost = this.calculateFutureCost(20, monthlyBill);

    this.recommendation.twentyYearUtilityCost = twentyYearUtilityCost;
    this.recommendation.twentyYearSavings = twentyYearUtilityCost - arrayCost;
    this.recommendation.averageAnnualSavings = this.recommendation.twentyYearSavings / config.flags.loanYears;
};

// timespan in years
// TODO: build in more sophisticated future assessment
RecommendationEngine.prototype.calculateFutureCost = function(timespan, monthlyBill) {

    // call statbeaureau website for inflation
    // if (exceedsMaxSize) use the rate

    return (monthlyBill * MONTHS_IN_YEAR) * timespan * Math.pow(config.flags.priceIncrease, timespan);
};

RecommendationEngine.prototype.getRecommendation = function() {
    return this.recommendation;
};

module.exports = RecommendationEngine;
