const express = require('express');
const router = express.Router();
const writer = require('./writeToMongo').writeToMongo;

/* Write Data to Mongo*/
router.get('/writeDataToMongo', function (req, res, next) {
    writer().then(response =>{
        res.send('Return Data Population Done');
    }, err =>{
        res.status(500);
    })

});

const getCVCInfo = require('./retrieveCSVInfo').getCVCInformation;
router.get('/retrieveCVC', function(req, res, next){
    let params = req.body;
    getCVCInfo(params).then(function(result){
        res.send(result);
        res.status(200);
    }, function(err){
        res.status(500);
    })
});
const getStates = require('./retrieveCSVInfo').getStates;
router.get('/getStates', function(req, res, next){
    let params = req.body;
    getStates(params).then(function(result){
        res.send(result);
        res.status(200);
    }, function(err){
        res.status(500);
    });

});

const getDistricts = require('./retrieveCSVInfo').getDistrictNames;
router.get('/getDistricts', function(req, res, next){
    let params = req.body;
    getDistricts(params).then(function(result){
        res.send(result);
        res.status(200);
    }, function(err){
        res.status(500);
    });

});

module.exports = router;
