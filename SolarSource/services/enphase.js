/**
 * Created by grahamturk on 11/19/15.
 */

var config = require('../config');
var request = require('superagent-bluebird-promise');

var EnlightenUser = require('../models/enlighten-user')

var authorization_url = config.enphase.authorization_url;
var api_key = config.enphase.api_key;
var endpoint = config.enphase.endpoint;
var user_id = config.enphase.sample_user_id;

// make the request to the auth url
function makeAuthRequest() {
    return request.get(authorization_url)
        .query({
            redirect: config.enphase.redirect_url
        })
        .promise();
}

// wrappers for all api endpoints

function requestHelper(system_user_id, extension) {
    return request.get(endpoint + extension)
        .set({'enlighten-api-user-id': system_user_id})
        .query({key: api_key, user_id: system_user_id})
        .accept('application/json')
        .promise();
}

function getEnergyLifetime(system_user_id, system_id, start_date, end_date) {

    var extension = '/systems/' + system_id + '/energy_lifetime';
    if (start_date == undefined || end_date == undefined) {
        return request.get(endpoint + extension)
            .set({'enlighten-api-user-id': system_user_id})
            .query({key: api_key, user_id: system_user_id})
            .accept('application/json')
            .promise();
    }

    return request.get(endpoint + extension)
        .query({
            start_date: start_date,
            end_date: end_date
        })
        .set({'enlighten-api-user-id': system_user_id})
        .query({key: api_key, user_id: system_user_id})
        .accept('application/json')
        .promise();
}

function getEnvoys(system_user_id, system_id) {
    var extension = '/systems/' + system_id + '/envoys';
    return request.get(endpoint + extension)
        .set({'enlighten-api-user-id': system_user_id})
        .query({key: api_key, user_id: system_user_id})
        .accept('application/json')
        .promise();
}

// hasQuery is boolean, queries is false, TODO: look into paging
function getIndex(system_user_id, hasQuery, queries) {
    var extension = '/systems';
    if (hasQuery) {
        return request.get(endpoint + extension)
            .set({'enlighten-api-user-id': system_user_id})
            .query({key: api_key, user_id: system_user_id})
            .accept('application/json')
            .promise();
    } else {
        return request.get(endpoint + extension)
            .query(queries)
            .set({'enlighten-api-user-id': system_user_id})
            .query({key: api_key, user_id: system_user_id})
            .accept('application/json')
            .promise();
    }

}

function getInventory(system_user_id, system_id) {
    var extension = '/systems/' + system_id + '/inventory';
    return request.get(endpoint + extension)
        .set({'enlighten-api-user-id': system_user_id})
        .query({key: api_key, user_id: system_user_id})
        .accept('application/json')
        .promise();
}

function getMonthlyProduction(system_user_id, system_id, start_date) {
    var extension = '/systems/' + system_id + '/monthly_production';
    return request.get(endpoint + extension)
        .query({
            start_date: start_date
        })
        .set({'enlighten-api-user-id': system_user_id})
        .query({key: api_key, user_id: system_user_id})
        .accept('application/json')
        .promise();
}

function getRgmStats(system_user_id, system_id, start_at, end_at) {
    var extension = '/systems/' + system_id + '/rgm_stats';
    return request.get(endpoint + extension)
        .query({
            start_at: start_at,
            end_at: end_at
        })
        .set({'enlighten-api-user-id': system_user_id})
        .query({key: api_key, user_id: system_user_id})
        .accept('application/json')
        .promise();
}

// system_id can be an array
function getStats(system_user_id, system_id, start_at, end_at) {
    var extension = '/systems/' + system_id + '/stats';
    return request.get(endpoint + extension)
        .query({
            start_at: start_at,
            end_at: end_at
        })
        .set({'enlighten-api-user-id': system_user_id})
        .query({key: api_key, user_id: system_user_id})
        .accept('application/json')
        .promise();
}

function getSummary(system_user_id, system_id, summary_date) {
    var extension = '/systems/' + system_id + '/summary';
    return request.get(endpoint + extension)
        .query({
            summary_date: summary_date
        })
        .set({'enlighten-api-user-id': system_user_id})
        .query({key: api_key, user_id: system_user_id})
        .accept('application/json')
        .promise();
}

module.exports.makeAuthRequest = makeAuthRequest;
module.exports.getEnergyLifetime = getEnergyLifetime;
module.exports.getEnvoys = getEnvoys;
module.exports.getIndex = getIndex;
module.exports.getInventory = getInventory;
module.exports.getMonthlyProduction = getMonthlyProduction;
module.exports.getRgmStats = getRgmStats;
module.exports.getStats = getStats;
module.exports.getSummary = getSummary;