/**
 * Created by grahamturk on 10/22/15.
 */

var mongoose = require('mongoose');



var recommendationSchema = mongoose.Schema({
    area: {
        units: String,
        value: Number
    },
    power_output: {
        units: String,
        value: Number
    }
});


var homeSchema = mongoose.Schema({
    lat: Number,
    lon: Number,
    energy: {},
    roof: {},
    recommendation: {
        type: mongoose.Schema.ObjectId,
        ref: 'recommendationSchema'
    }
});


var Home = mongoose.model('Home', homeSchema);

module.exports = Home;
