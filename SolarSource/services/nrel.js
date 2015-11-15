/**
 * Created by grahamturk on 10/22/15.
 */

var config = require('../config');
var plainRequest = require('superagent');
var request = require('superagent-bluebird-promise');

var endpoint = config.nrel.endpoint_prefix;
var api_key = config.nrel.api_key;


/* Each method returns a promise */

function getOpenPVSummaries(zipcode) {
    return request.get(endpoint + '/api/solar/open_pv/installs/summaries')
        .query({
            api_key: api_key,
            zipcode: zipcode
        })
        .accept('json')
        .promise();
}

function getPVWatts(capacity, arrayType, tiltAngle, azimuthAngle, lat, lon) {
    return request.get(endpoint + '/api/pvwatts/v5.json')
        .query({
            api_key: api_key,
            system_capacity: capacity,
            module_type: 1,
            losses: 10,
            array_type: arrayType,
            tilt: tiltAngle,
            azimuth: azimuthAngle,
            lat: lat,
            lon: lon
        })
        .accept('json')
        .promise();
}

function getSolarResouceData(lat, lon) {
    return request.get(endpoint + '/api/solar/solar_resource/v1.json')
        .query({
            api_key: api_key,
            lat: lat,
            lon: lon
        })
        .accept('json')
        .promise();
}

function getUtilityRates(lat, lon) {
    return request.get(endpoint + '/api/utility_rates/v3.json')
        .query({
            api_key: api_key,
            lat: lat,
            lon: lon
        })
        .accept('json')
        .promise();
}

// https://developer.nrel.gov/api/solar/solar_resource/v1.json?api_key=gCScRN5rrK50DE2xoZcLpSoyFX3Nm1U2b0e6zVap&lat=40&lon=-105
function getResourceNoPromise(lat, lon) {
    plainRequest.get(endpoint + '/api/solar/solar_resource/v1.json')
        .query({
            api_key: api_key,
            lat: lat,
            lon: lon
        })
        .accept('json')
        .end(function(err, res) {
            if (err)
                console.log(err);
            else
                console.log(res.body.outputs);
        });
}

module.exports.getSummaries = getOpenPVSummaries;
module.exports.getPVWatts = getPVWatts;
module.exports.getSolarResourceData = getSolarResouceData;
module.exports.getUtilityRates = getUtilityRates;
module.exports.getResourceNoPromise = getResourceNoPromise;
