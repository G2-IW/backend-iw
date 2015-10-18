/**
 * Created by grahamturk on 10/17/15.
 */

var fs = require('fs');
var config = require('../config');
var request = require('superagent');

var api_key = config.nrel.api_key;

function getOpenPVSummaries(zip) {
  request
    .get('/api/solar/open-pv/installs/summaries')
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

function getPVWatts(capacity, array_type, tilt_angle, azimuth_angle, address) {
  request
    .get('/api/pvwatts5/v5.format')
    .query({
      format: "json",
      api_key: api_key,
      system_capacity: capacity,
      module_type: 0,
      array_type: array_type,
      tilt: tilt_angle,
      azimuth: azimuth_angle,
      address: address
    })
    .accept('json')
    .end(function (err, res) {
      if (err) {
        console.log(err);
        return err;
      } else {
        return res.body;
      }
    })
}

function getSolarResouceData(address) {
  request
    .get('/api/solar/data_query/v1.format')
    .query({
      format: "json",
      api_key: api_key,
      address: address
    })
    .accept('json')
    .end(function (err, res) {
      if (err) {
        console.log(err);
        return err;
      } else {
        return res.body;
      }
    })
}

function getUtilityRates(address) {
  request
    .get('/api/utility_rates/v3.format')
    .query({
      format: "json",
      api_key: api_key,
      address: address
    })
    .accept('json')
    .end(function (err, res) {
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


