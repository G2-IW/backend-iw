/**
 * Created by grahamturk on 11/19/15.
 */

var express = require('express');
var router = express.Router();
var NullDocumentError = require('../services/NullDocumentError');
var EnlightenUser = require('../models/enlighten-user');
var mongoose = require('mongoose');
var _ = require('underscore');
var request = require('superagent-bluebird-promise');
var enphaseHelper = require('../services/enphase');
var config = require('../config');
mongoose.Promise = require('bluebird');

// wrapper for authorization link
router.get('/link', function(req, res, next) {
    enphaseHelper.makeAuthRequest()
        .then(function() {
            res.status(200).json({success: 'Authorization granted'});
        }).catch(function(err) {
            res.status(500).json({error: err.message});
        })
});


// callback from authorization
router.get('/callback', function(req, res, next) {
    var user_id = req.query.user_id;

    var promise = EnlightenUser.findOne({system_user_id: user_id}).exec();
    promise.then(function(user) {
        // TODO: determine if makes sense to have home connected to EnlightenUser
        if (user == null) {
            var newUser = new EnlightenUser({
                first_name: null,
                last_name: null,
                system_user_id: user_id
            });
            return newUser.save();
         } else {
            return user;
        }

    }).then(function(user) {
        res.status(201).json(user);
    }).catch(function(err) {
        res.status(500).json({error: err.message});
    })

});

router.get('/', function(req, res, next) {
    var promise = EnlightenUser.findOne({system_user_id: req.query.user_id}).exec();
    promise.then(function(user) {
        if (user == null) {
            throw new NullDocumentError('Enlighten user not found');
        } else {
            res.status(200).json(home);
        }
    }).catch(NullDocumentError, function(err) {
        res.status(400).json({error: err.message});
    }).catch(function(err) {
        res.status(500).json({error: err.message});
    })
});


router.post('/', function(req, res, next) {
    var requiredParams = ['user_id', 'first_name', 'last_name'];
    /*_.each(requiredParams, function(element, index, list) {
        if (!req.body.hasOwnProperty(element)) {
            res.status(400).json({error: 'Invalid request'});
        }
    });*/

    // Check that all required parameters exist
    for (; i < requiredParams.length; i++) {
        if (!req.body.hasOwnProperty(requiredParams[i])) {
            res.status(400).json({error: 'Invalid request'});
            return;
        }
    }

    /* Check if Enlighten User is already in db */
    var promise = EnlightenUser.findOne({system_user_id: req.body.user_id}).exec();

    promise.then(function(user) {
        if (user == null) {
            var newUser = new EnlightenUser({
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                system_user_id: req.body.user_id
            });
            return newUser.save();
        } else {
            throw new Error('Duplicate user attempted creation');
        }
    }).then(function(user) {
        res.status(201).json(user);
    }).catch(function(err) {
        if (err.message = 'Duplicate user attempted creation') {
            res.status(400);
        } else {
            res.status(500);
        }
        res.json({error: err.message});
    })
});

router.put('/:user_id', function(req, res, next) {
    var promise = EnlightenUser.findById(req.params.user_id).exec();

    var params = ['first_name', 'last_name'];

    promise.then(function(user) {
        if (user == null) {
            throw new NullDocumentError('User not found');
        }
        for (var key in params) {
            if (req.body.hasOwnProperty(key)) {
                user.key = req.body.key;
            }
        }
        return user.save();

    }).then(function(updatedUser) {
        res.status(200).json(updatedUser);

    }).catch(NullDocumentError, function(err) {
        res.status(400).json({error: error.message});

    }).catch(function(err) {
        res.status(500).json({error: error.message});
    });

});
