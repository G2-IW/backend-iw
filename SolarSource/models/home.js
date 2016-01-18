/**
 * Created by grahamturk on 10/22/15.
 */

var mongoose = require('mongoose');

var financeOptions = 'loan lease buy'.split(' ');

var homeSchema = mongoose.Schema({
    lat: Number,
    lon: Number,
    energy: {},
    roof: {},
    financeType: {type: String, enum: financeOptions},
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
