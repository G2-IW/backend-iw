/**
 * Created by grahamturk on 10/22/15.
 */

var mongoose = require('mongoose');



var recommendationSchema = mongoose.Schema({
    arraySize: Number,
    exceedsMaxSize: Boolean,
    arrayCapacity: Number,
    arrayCost: Number,
    timeToPayOff: Number,
    tenYearSavings: Number,
    twentyYearSavings: Number
});


var homeSchema = mongoose.Schema({
    lat: Number,
    lon: Number,
    energy: {},
    roof: {},
    recommendation: {
        arraySize: Number,
        exceedsMaxSize: Boolean,
        arrayCapacity: Number,
        arrayCost: Number,
        timeToPayOff: Number,
        tenYearSavings: Number,
        twentyYearSavings: Number
    },
    performance: {}
});


var Home = mongoose.model('Home', homeSchema);

module.exports = Home;
