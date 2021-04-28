const express = require('express');
const stateRoute = require('./states')

const router = express();

router.use('/states', stateRoute)

module.exports = router;
