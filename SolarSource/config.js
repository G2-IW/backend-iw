/**
 * Created by grahamturk on 10/22/15.
 */

module.exports.nrel = {
    endpoint_prefix: 'https://developer.nrel.gov',
    api_key: 'gCScRN5rrK50DE2xoZcLpSoyFX3Nm1U2b0e6zVap'
};

module.exports.mongodb = {
    server_path: "mongodb://localhost/test"
};

module.exports.flags = {
    // ["wattvision", "monthly"]
    energy: "monthly",
    peak: 200,
    average: 100,
    startFromCapacity: false,
    threshold: .05,
    inflation: 1.05
};
