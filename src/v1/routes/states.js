const express = require('express');
const States = require('../models/states')
const router = express.Router();

/* GET States. */
router.get('/', async (req, res, next) => {
    try { res.send(await States.find()) }
    catch { res.status(500) }
});

router.get('/:stateID', async (req, res, next) => {
    try { res.send(await States.findOne({ id: req.params.stateID })) }
    catch { res.status(500) }
})

router.get('/:stateID/district', (req, res, next) => {
    res.send('Return Districts List for the state');
})

router.get('/:stateID/district/:districtID', (req, res, next) => {
    res.send('Return Districts by ID');
})

module.exports = router;