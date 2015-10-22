/**
 * Created by grahamturk on 10/22/15.
 */

var config = require('../config');
var request = require('superagent');

var endpoint = config.nrel.endpoint_prefix;
var api_key = config.nrel.api_key;

function getOpenPVSummaries(zip) {
    request
        .get(endpoint + '/api/solar/open-pv/installs/summaries')
        .query({
            api_key: api_key,
            zipcode: zipcode
        })
        .accept('json')
        .end(function(err, res) {
            if (err) {
                // console.log(err);
                return err;
            } else {
                return res.body;
            }
        })
}

function getPVWatts(capacity, array_type, tilt_angle, azimuth_angle, lat, lon) {
    request
        .get(endpoint + '/api/pvwatts5/v5.format')
        .query({
            format: "json",
            api_key: api_key,
            system_capacity: capacity,
            module_type: 0,
            array_type: array_type,
            tilt: tilt_angle,
            azimuth: azimuth_angle,
            lat: lat,
            lon: lon
        })
        .accept('json')
        .end(function(err, res) {
            if (err) {
                console.log(err);
                return err;
            } else {
                return res.body;
            }
        })
}

function getSolarResouceData(lat, lon) {
    request
        .get(endpoint + '/api/solar/data_query/v1.format')
        .query({
            format: "json",
            api_key: api_key,
            lat: lat,
            lon: lon
        })
        .accept('json')
        .end(function(err, res) {
            if (err) {
                console.log(err);
                return err;
            } else {
                return res.body;
            }
        })
}

function getUtilityRates(lat, lon) {
    request
        .get(endpoint + '/api/utility_rates/v3.format')
        .query({
            format: "json",
            api_key: api_key,
            lat: lat,
            lon: lon
        })
        .accept('json')
        .end(function(err, res) {
            if (err) {
                console.log(err);
                return err;
            } else {
                return res.body;
            }
        })
}

module.exports.getSummaries = getOpenPVSummaries;
module.exports.getPVWatts = getPVWatts;
module.exports.getSolarResourceData = getSolarResouceData;
module.exports.getUtilityRates = getUtilityRates;
