/**
 * Created by grahamturk on 11/19/15.
 */

var config = require('../config');
var request = require('superagent-bluebird-promise');
var _ = require('underscore');

var endpoint = config.wattvision.endpoint_prefix;

function getWattvisionData(sensor_id, api_id, api_key, type, start_time, end_time) {
    if (!_.contains(['rate', 'consumption', 'latest_rate', 'net_consumption'], type)) {
        throw new Error('Invalid Wattvision data type');
    }

    return request.get(endpoint)
        .query({
            sensor_id: sensor_id,
            api_id: api_id,
            api_key: api_key,
            type: type,
            start_time: start_time,
            end_time: end_time
        })
        .accept('json')
        .promise();
}


// don't think this method is necessary
function postWattvisionData(sensor_id, api_id, api_key, time, watts, watthours) {
    return request.post(endpoint)
        .send({
            sensor_id: sensor_id,
            api_key: api_key,
            time: time,
            watts: watts,
            watthours: watthours
        })
        .accept('json')
        .promise();
}


module.exports.getWattvisionData = getWattvisionData;
module.exports.postWattvisionData = postWattvisionData;
