/**
 * Created by grahamturk on 10/24/15.
 */

var helper = require('../services/handle-units');
var config = require('../config');

var HomeRoofModel = function(roofDict) {
    this.roofDict = roofDict;
    this.roofProfile = {};
    this.roofScore = -1;

    this.roofProfile = {
        tilt: null,
        usableArea: null,
        direction: null,
        elevation: null,
        arrayType: null
    };

    // TODO: change when roof is more sophisticated
    //parseRoof();
    this.roofProfile = roofDict;
    this.roofProfile.arrayType = config.nrel.arrayType;
};

HomeRoofModel.prototype.parseRoof = function() {
    for (var key in this.roofDict) {
        /* if (typeof this.roofDict.key == 'object' && this.roofDict.key.hasOwnProperty('units')) {
            this.roofProfile.key = helper.convertUnits(this.roofDict.key.units, this.roofDict.key.value);
        } else {
            this.roofProfile.key = this.roofDict.key;
        }
        */
        this.roofProfile.key = this.roofDict.key;
    }
};

HomeRoofModel.prototype.getRoofScore = function() {
    return this.roofScore;
};

HomeRoofModel.prototype.getRoofProfile = function() {
    return this.roofProfile;
};

module.exports = HomeRoofModel;
