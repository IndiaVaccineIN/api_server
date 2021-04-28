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

module.exports = router;
