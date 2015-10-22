/**
 * Created by grahamturk on 10/22/15.
 */

var mongoose = require("mongoose");

var homeSchema = mongoose.Schema({
    address: String,
    energy_score: Number,
    roof_score: Number
});

homeSchema.methods.formatHome = function() {
    return {
        address: this.address,
        energy_score: this.energy_score,
        roof_score: this.roof_score
    }
};

var Home = mongoose.model('Home', homeSchema);

module.exports = Home;
