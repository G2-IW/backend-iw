/**
 * Created by grahamturk on 10/24/15.
 */

var MS_TO_HR = 1 / (1000 * 60);
var WATTS_TO_KW = 1 / 1000;

var HomeEnergyModel = function(energyDict, wattvisionData) {
    this.energyDict = energyDict;
    this.energyProfile = {};
    this.energyScore = -1;

    this.energyProfile = {
        wattvision: null,
        monthlyConsumption: null,
        monthlyCost: null,
        useWattvision: null,
        timeToPayofff: null,
        paymentPerMonth: null,
        systemCapacity: null
    };

    if (this.energyDict.hasOwnProperty('wattvision') && this.energyDict.useWattvision == true) {
        // this.parseWattvision();
    } else {
        // TODO: change when profile is more complicated
        this.energyProfile = energyDict;

        // Set it to the returned Wattvision data
        this.energyProfile.wattvision = wattvisionData;

        this.energyProfile.systemCapacity = 4;
        // parseMonthlyConsumption();
    }
};

HomeEnergyModel.prototype.parseWattvision = function() {

    /*
        Wattvision HTTP request

        GET: https://www.wattvision.com/api/v0.2/elec?sensor_id=###&api_id=###&api_key=###&type=rate
        &start_time=2013-01-18T21:50:00&end_time=2013-01-18T22:57:00
     */



    // Parse Wattvision data
    var wattvisionData = this.energyDict.wattvision;
    if (wattvisionData.units != 'watts') {
        // convert to watts
    }

    generateConsumptionProfile(wattvisionData.data);
};

HomeEnergyModel.prototype.generateConsumptionProfile = function(data) {

    var totalWatts = 0;
    /*
    var maxPQ = new PQ(10);
    var minPQ = new PQ(10);
    */
    for (var i = 0; i < data.length; i++) {
        var entry = data[i];
        totalWatts += entry.v;
    }
    var timespanMS = Date.parse(data[data.length - 1].t) - Date.parse(data[0].t);
    var timespanHR = timespanMS * MS_TO_HR;

    var avgWatts = (totalWatts / data.length).toPrecision(3);
    var avgKW = avgWatts * WATTS_TO_KW;

    this.energyProfile.totalConsumption = avgKW * timespanHR;
};

HomeEnergyModel.prototype.parseMonthlyConsumption = function() {
    this.energyProfile.totalConsumption = this.energyDict.monthlyConsumption;
};

HomeEnergyModel.prototype.getEnergyScore = function() {
    return this.energyScore;
};

HomeEnergyModel.prototype.getEnergyProfile = function() {
    return this.energyProfile;
};

module.exports = HomeEnergyModel;
