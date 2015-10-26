/**
 * Created by grahamturk on 10/24/15.
 */

var helper = require('../services/handle-units');

var HomeRoofModel = function(roofDict) {
    this.roofDict = roofDict;
    this.roofProfile = {};
    this.roofScore = -1;

    parseRoof();
};

function parseRoof() {
    for (var key in this.roofDict) {
        if (typeof this.roofDict.key == 'object' && this.roofDict.key.hasOwnProperty('units')) {
            this.roofProfile.key = helper.convertUnits(this.roofDict.key.units, this.roofDict.key.value);
        } else {
            this.roofProfile.key = this.roofDict.key;
        }
    }
}

HomeRoofModel.prototype.getRoofScore = function() {
    return this.roofScore;
};

module.exports = HomeRoofModel;
