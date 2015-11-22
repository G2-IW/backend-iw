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

function getOpenPVSummariesDefault() {
    return request.get(endpoint + '/api/solar/open_pv/installs/summaries')
        .query({
            api_key: api_key,
            state: 'CA'
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

// TODO: delete this method
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

function getPVDAQMetadata() {
    return request.get(endpoint + '/api/pvdaq/v3/sites.json')
        .auth(config.nrel.pvdaq.username, config.nrel.pvdaq.username)
        .query({
            api_key: api_key
        })
        .accept('json')
        .promise();
}

module.exports.getSummaries = getOpenPVSummaries;
module.exports.getSummariesDefault = getOpenPVSummariesDefault;
module.exports.getPVWatts = getPVWatts;
module.exports.getSolarResourceData = getSolarResouceData;
module.exports.getUtilityRates = getUtilityRates;
module.exports.getResourceNoPromise = getResourceNoPromise;
module.exports.getPVDAQMetadata = getPVDAQMetadata;
