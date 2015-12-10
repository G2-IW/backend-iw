/**
 * Created by grahamturk on 10/21/15.
 */

var express = require('express');
var router = express.Router();
var NullDocumentError = require('../services/NullDocumentError');
var Home = require('../models/home');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var ObjectId = mongoose.Types.ObjectId;

/**
 * @apiDefine HomeNotFoundError
 * @apiError HomeNotFound The <code>id</code> of the Home was not found.
 * @apiErrorExample {json} Error-response:
 *      HTTP/1.1 404 Not Found
 *      {
 *          "error": "HomeNotFound
 *      }
 */

/**
 * @api {get} /api/homes Request home information
 * @apiName GetHome
 * @apiGroup Home
 *
 * @apiParam {Number} lat Home address latitude
 * @apiParam {Number} lon Home address longitude
 *
 * @apiSuccess (200) {Object} home A home object
 *
 * @apiUse HomeNotFoundError
 *
 * @apiExample {curl} Example usage:
 *      curl -i http://localhost:8080/homes?lat=45.345&lon=64.981
 */

router.get('/', function(req, res, next) {
    var promise = Home.findOne({lat: req.query.lat, lon: req.query.lon}).exec();

    promise.then(function(home) {
        if (home == null) {
            throw new NullDocumentError('Home not found');
        } else {
            res.status(200).json(home);
        }
    }).catch(NullDocumentError, function(err) {
        res.status(400).json({error: err.message});
    }).catch(function(err) {
        res.status(500).json({error: err.message});
    })
});

/**
 * @api {get} /api/homes/:id Request home information
 * @apiName GetHomeId
 * @apiGroup Home
 *
 * @apiParam {Number} id Home's unique database id
 *
 * @apiSuccess (200) {Object} home A home object
 *
 * @apiUse HomeNotFoundError
 *
 * @apiExample {curl} Example usage:
 *      curl -i http://localhost:8080/homes/240302030400304
 */
router.get('/:id', function(req, res, next) {
    if (!ObjectId.isValid(req.params.id)) {
        res.status(400).json({error: 'Invalid id'});
        return;
    }

    var promise = Home.findById(req.params.id).exec();

    promise.then(function(home) {
        if (home == null) {
            console.log('Inside null home');
            throw new NullDocumentError('Home not found');
        } else {
            res.status(200).json(home);
        }
    }).catch(NullDocumentError, function(err) {
        res.status(400).json({error: err.message});
    }).catch(function(err) {
        res.status(500).json({error: err.message});
    })
});

/**
 * @api {post} /api/homes Create a home
 * @apiName createHome
 * @apiGroup Home
 *
 * @apiParam {Number} lat Home address latitude
 * @apiParam {Number} lon Home address longitude
 * @apiParam {Object} energy Home energy profile (see below)
 * @apiParam {Object} roof Home roof profile (see below)
 *
 * @apiSuccess (201) {Object} home The newly created home
 *
 * @apiError ServerError Home creation failed
 *
 * @apiParamExample {json} Request-Example:
 *      {
 *          "lat": 44.079,
 *          "lon": -93.243,
 *          "energy": {
 *              "wattvision": {
 *                  "sensor_id" 0,
 *                  "api_key": 0,
 *                  "api_id": 0,
 *                  "type": "rate",
 *                  "start_time": "2013-01-18T21:50:00",
 *                  "end_time": "2013-01-18T22:57:00"
 *              },
 *              "monthlyConsumption": 1553,
 *              "monthlyCost": 100,
 *              "useWattvision": false,
 *              "timeToPayofff": {
 *                  "units": "years",
 *                  "value": "10"
 *              },
 *              "paymentPerMonth": 100
 *          },
 *          "roof": {
 *              "tilt": 10,
 *              "area": {
 *                  "units": "sqft",
 *                  "value": 100
 *              },
 *              "direction": 0,
 *              "elevation": {
 *                  "units": "ft",
 *                  "value": 20
 *              }
 *          }
 *      }
 */
router.post('/', function(req, res, next) {

    var requiredParams = ['lat', 'lon', 'energy', 'roof'];

    var i = 0;
    for (; i < requiredParams.length; i++) {
        if (!req.body.hasOwnProperty(requiredParams[i])) {
            res.status(400).json({error: 'Invalid request'});
            return;
        }
    }

    /* Check if home is already in db */
    var promise = Home.findOne({lat: req.body.lat, lon: req.body.lon}).exec();
    promise.then(function (home) {
        if (home == null) {
            var newHome = new Home({
                lat: req.body.lat,
                lon: req.body.lon,
                energy: req.body.energy,
                roof: req.body.roof
            });
            return newHome.save();
        } else {
            /* throw new Error('Duplicate home attempted creation'); */
            return home;
        }
    }).then(function(home) {
        res.status(201).json(home);
    }).catch(function(err) {
        res.status(500).json({error: err.message});
    });
});


/**
 * @api {put} /api/homes/:id Updates a home
 * @apiName updateHome
 * @apiGroup Home
 *
 * @apiDescription: All fields are optional
 *
 * @apiParam {Number} id Home's unique database id
 * @apiParam {Number} [lat] Home address latitude
 * @apiParam {Number} [lon] Home address longitude
 * @apiParam {Object} [energy] Home energy profile (see below)
 * @apiParam {Object} [roof] Home roof profile (see below)
 * @apiParam {Object} [performance] Performance of existing solar array
 *
 * @apiSuccess (200) {Object} home The updated home
 *
 * @apiError ServerError Home update failed
 *
 * @apiParamExample {json} Request-Example:
 *      {
 *          "energy": {
 *              "monthly": {
 *                  "units": "kwh",
 *                  "value": 2000
 *              }
 *          }
 *      }
 */
router.put('/:id', function(req, res, next) {
    if (!ObjectId.isValid(req.params.id)) {
        res.status(400).json({error: 'Invalid id'});
        return;
    }

    var promise = Home.findById(req.params.id).exec();

    var params = ['lat', 'lon', 'energy', 'roof', 'performance'];

    promise.then(function(home) {
        if (home == null) {
            throw new NullDocumentError('Home not found');
        }
        for (var key in params) {
            if (req.body.hasOwnProperty(key)) {
                home.key = req.body.key;
            }
        }
        return home.save()
    }).then(function(updatedHome) {
        res.status(200).json(updatedHome);

    }).catch(NullDocumentError, function(err) {
        res.status(400).json({error: error.message});
    }).catch(function(err) {
        res.status(500).json({error: error.message});
    });
});

/**
 * @api {delete} /api/homes/:id Delete home from database
 * @apiName DeleteHome
 * @apiGroup Home
 *
 * @apiParam {Number} id Home's unique database id
 *
 * @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "success": "Home deleted"
 *      }
 *
 * @apiUse HomeNotFoundError
 */
router.delete('/:id', function(req, res, next) {
    if (!ObjectId.isValid(req.params.id)) {
        res.status(400).json({error: 'Invalid id'});
        return;
    }

    Home.findByIdAndRemove(req.params.id, function(err) {
        if (err) res.status(404).json({error: err.message});
        else res.status(200).json({success: "Home deleted"});
    })
});


/**
 * @api {get} /api/homes/wattvision/:id Send Wattvision monitoring data
 * @apiName SendWattvision
 * @apiGroup Home
 *
 * @apiDescription: All fields are required. Wattvision values can be found on API settings page.
 *
 * @apiParam {Number} id Home's unique database id
 * @apiParam {Number} apiKey Wattvision API key
 * @apiParam {Number} apiID Wattvision API ID
 * @apiParam {Number} sensorID Wattvision system ID
 *
 * @apiSuccess (200) {Object} home The updated home
 *
 * @apiError ServerError Request failed
 *
 * @apiExample {curl} Example usage:
 *      curl -i http://localhost:8080/homes/wattvision/1323454934?sensorID=513&apiKey=24as78390$&apiID=453sjfk5
 *
 *
 */
router.get('/wattvision/:id', function(req, res, next) {
    if (!ObjectId.isValid(req.params.id)) {
        res.status(400).json({error: 'Invalid id'});
        return;
    }

    var promise = Home.findById(req.params.id).exec();

    var params = ['sensorID, apiID, apiKey'];

    promise.then(function(home) {
        if (home == null) {
            throw new NullDocumentError('Home not found');
        }
        for (var key in params) {
            if (req.query.hasOwnProperty(key)) {
                home.energy.wattvision.key = req.query.key;
            }
        }
        return home.save()
    }).then(function(updatedHome) {
        res.status(200).json(updatedHome);

    }).catch(NullDocumentError, function(err) {
        res.status(400).json({error: error.message});
    }).catch(function(err) {
        res.status(500).json({error: error.message});
    });
});



module.exports = router;
