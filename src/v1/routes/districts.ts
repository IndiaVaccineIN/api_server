import express from 'express';
const router = express.Router();

/* GET Districts. */
router.get('/', function (req, res, next) {
    res.send('Return District List');
});

router.get('/:districtID', function (req, res, next) {
    res.send('Return Districts by ID');
})

export default router;