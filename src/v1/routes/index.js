const express = require('express');
const router = express.Router();
const {dumpExcelDataToMongo, writeDataToMongo} = require('../controllers/writeToMongo');
const {getCVCInformation,getStates, getDistrictNames} = require('../controllers/retrieveCVCInfo');

/* Write Data to Mongo*/
router.post('/writeDataToMongo', function (req, res, next) {
    let params = req.body;
    writeDataToMongo(params).then(response =>{
        res.send('Return Data Population Done');
    }, err =>{
        res.status(500);
    })

});

/* Read Data from Excel and Dump it to Mongo*/
router.get('/dumpExcelToMongo', function (req, res, next) {
    dumpExcelDataToMongo().then(response =>{
        res.send('Return Data Population Done');
    }, err =>{
        res.status(500);
    })

});


router.get('/retrieveCVC/:state/:district', function(req, res, next){
    let params = req.params;
    getCVCInformation(params).then(function(result){
        res.send(result);
        res.status(200);
    }, function(err){
        res.status(500);
    })
});

router.get('/getStates', function(req, res, next){
    let params = req.body;
    getStates(params).then(function(result){
        res.send(result);
        res.status(200);
    }, function(err){
        res.status(500);
    });

});

router.get('/getDistricts/:state', function(req, res, next){
    let params = req.params;
    getDistrictNames(params).then(function(result){
        res.send(result);
        res.status(200);
    }, function(err){
        res.status(500);
    });

});

module.exports = router;