/**
 * Created by grahamturk on 10/22/15.
 */

module.exports.url = 'http://localhost:3000';

module.exports.nrel = {
    endpoint_prefix: 'https://developer.nrel.gov',
    api_key: 'gCScRN5rrK50DE2xoZcLpSoyFX3Nm1U2b0e6zVap',
    pvdaq: {
        username: 'gturk',
        password: 'y5a24Nj9hb7h63fXt',
        siteIds: [1234, 1236]
    },
    pvwatts5: {
        moduleType: 0,
        losses: 10
    },
    arrayType: 1,
    tilt: 30,
    azimuth: 180
};

module.exports.mongodb = {
    server_path: 'mongodb://127.0.0.1:27017/prod'
};

module.exports.solarcast = {
    api_key: '55CHNRWQDY'
};

module.exports.flags = {
    // ["wattvision", "monthly"]
    energy: 'monthly',
    peak: 200,
    average: 100,
    startFromCapacity: false,
    threshold: .05,
    priceIncrease: 1,
    annualInterest :.08,
    loanYears: 20
};

module.exports.enphase = {
    redirect_url: module.exports.url + '/enphase/callback',
    sample_user_id: '4d7a45774e6a41320a',
    api_key: '8807c367eda391b29447301c3cb627be',
    authorization_url: 'https://enlighten.enphaseenergy.com/app_user_auth/new?app_id=1409612302941',
    endpoint: 'https://api.enphaseenergy.com/api/v2'
};

module.exports.wattvision = {
    endpoint_prefix: 'https://www.wattvision.com/api/v0.2/elec',
    type: 'rate'
};
