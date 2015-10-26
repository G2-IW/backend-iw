/**
 * Created by grahamturk on 10/23/15.
 */
var convert = require('convert-units');

var geocoderProvider = 'google';
var httpAdapter = 'http';
var extra = {};
var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra);

var CONVERSION = .3048;

function convertUnits(unitType, value) {
    if (unitType === 'sqft') {
       return value * (Math.pow(CONVERSION, 2));
    } else if (unitType = 'sqm') {
        return value / (Math.pow(CONVERSION, 2));
    }

    return convert(value).from(unitType).to('m');
}

function getZipCode(lat, lon) {
    return geocoder.reverse({lat: lat, lon: lon}).then(function(res) {
        return res.zipcode;
    });
}

module.exports.convertUnits = convertUnits;
module.exports.getZipCode = getZipCode;
