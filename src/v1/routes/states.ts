import express from 'express';
import States from '../models/states';
const router = express.Router();

/* GET States. */
router.get('/', async (req: any, res: any, next: any) => {
    try { res.send(await States.find()) }
    catch { res.status(500) }
});

router.get('/:stateID', async (req: any, res: any, next: any) => {
    try { res.send(await States.findOne({ id: req.params.stateID })) }
    catch { res.status(500) }
})

router.get('/:stateID/district', (req: any, res: any, next: any) => {
    res.send('Return Districts List for the state');
})

router.get('/:stateID/district/:districtID', (req: any, res: any, next: any) => {
    res.send('Return Districts by ID');
})

module.exports = router;