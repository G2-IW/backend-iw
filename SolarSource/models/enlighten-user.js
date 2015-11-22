/**
 * Created by grahamturk on 11/19/15.
 */

var mongoose = require('mongoose');

var enlightenUserSchema = mongoose.Schema({
    first_name: String,
    last_name: String,
    system_user_id: String
});

var EnlightenUser = mongoose.model('EnlightenUser', enlightenUserSchema);

module.exports = EnlightenUser;
