import express from 'express';
import {dumpExcelDataToMongo, writeDataToMongo} from '../controllers/writeToMongo';
import {getCVCInformation,getStates, getDistrictNames} from '../controllers/retrieveCVCInfo';
import PingController from "../controllers/ping";
const router = express.Router();

/* Write Data to Mongo*/
router.post('/writeDataToMongo', function (req, res, next) {
    let params = req.body;
    writeDataToMongo(params).then((response: any) => {
        res.send('Return Data Population Done');
    }, (err: any) => {
        res.status(500);
    })

});

/* Read Data from Excel and Dump it to Mongo*/
router.get('/dumpExcelToMongo', function (req, res, next) {
    dumpExcelDataToMongo().then((response: any) =>{
        res.send('Return Data Population Done'+ response);
    }, (err: any) => {
        res.status(500);
    })

});


router.get('/retrieveCVC/:state/:district', function(req, res, next){
    let params = req.params;
    getCVCInformation(params).then(function(result: any){
        res.send(result);
        res.status(200);
    }, function(err: any){
        res.status(500);
    })
});

router.get('/getStates', function(req, res, next){
    let params = req.body;
    getStates(params).then(function(result: any) {
        res.send(result);
        res.status(200);
    }, function(err: any){
        res.status(500);
    });

});

router.get('/getDistricts/:state', function(req, res, next){
    let params = req.params;
    getDistrictNames(params).then(function(result: any){
        res.send(result);
        res.status(200);
    }, function(err: any){
        res.status(500);
    });
});

router.get("/ping", async (_req, res) => {
    const controller = new PingController();

    const response = await controller.getMessage({hello:"world"});
    return res.send(response);
});


router.get('/CVC',(req,res,next) =>{

});

export default router;
