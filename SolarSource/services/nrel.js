/**
 * Created by grahamturk on 10/22/15.
 */

var config = require('../config');
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

function getPVDAQMetadata() {
    // returns metadata for all PVDAQ sites
    return request.get(endpoint + '/api/pvdaq/v3/sites.json')
        .auth(config.nrel.pvdaq.username, config.nrel.pvdaq.password)
        .query({
            api_key: api_key
        })
        .accept('json')
        .promise();
}

function getPVDAQSiteData(system_id) {
    return request.get(endpoint + '/api/pvdaq/v3/site_data.format')
        .auth(config.nrel.pvdaq.username, config.nrel.pvdaq.password)
        .query({
            api_key: api_key,
            aggregate: 'monthly',
            system_id: system_id,
            start_date: '1/1/2015',
            end_date: '12/1/2015'
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
module.exports.getPVDAQSiteData = getPVDAQSiteData;
