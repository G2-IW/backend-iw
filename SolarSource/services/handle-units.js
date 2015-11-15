/**
 * Created by grahamturk on 10/23/15.
 */
var convert = require('convert-units');

var geocoderProvider = 'google';
var httpAdapter = 'http';
var extra = {};
var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra);

var CONVERSION = .3048;

function convertUnits(unitFrom, unitTo, value) {
    if (unitFrom === 'sqft' && unitTo == 'sqm') {
       return value * (Math.pow(CONVERSION, 2));
    } else if (unitFrom = 'sqm' && unitTo == 'sqft') {
        return value / (Math.pow(CONVERSION, 2));
    }

    return convert(value).from(unitFrom).to(unitTo);
}

// geocoder returns array of responses so have to do res[0]
function getZipCode(lat, lon) {
    return geocoder.reverse({lat: lat, lon: lon}).then(function(res) {
        return res[0].zipcode;
    });
}

module.exports.convertUnits = convertUnits;
module.exports.getZipCode = getZipCode;
