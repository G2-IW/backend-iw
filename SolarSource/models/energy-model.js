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

    if (wattvisionData != null) {
        this.parseWattvision(wattvisionData);
    } else {
        // TODO: change when profile is more complicated
        this.energyProfile = energyDict;
        this.energyProfile.systemCapacity = 4;
    }
};

/* Iterate through Wattvision data to get total energy consumed */
HomeEnergyModel.prototype.parseWattvision = function(wattvisionData) {
    // Parse Wattvision data
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

    this.energyProfile.monthlyConsumption = avgKW * timespanHR;
};

HomeEnergyModel.prototype.getEnergyScore = function() {
    return this.energyScore;
};

HomeEnergyModel.prototype.getEnergyProfile = function() {
    return this.energyProfile;
};

module.exports = HomeEnergyModel;
