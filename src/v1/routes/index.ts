import express from 'express';
// import {
//   dumpExcelDataToMongo,
//   writeDataToMongo,
// } from '../controllers/writeToMongo';
// import {
//   getCVCInformation,
//   getStates,
//   getDistrictNames,
// } from '../controllers/retrieveCVCInfo';
import {CVCController} from '../controllers/cvc';
import {MetaController} from '../controllers/meta';
import {VolunteerController} from '../controllers/volunteer';
import {FormController} from '../controllers/form';
const router = express.Router();

// /* Write Data to Mongo*/
// router.post('/writeDataToMongo', (req, res) => {
//   const params = req.body;
//   writeDataToMongo(params).then(
//     () => {
//       res.send('Return Data Population Done');
//     },
//     () => {
//       res.status(500);
//     }
//   );
// });

// /* Read Data from Excel and Dump it to Mongo*/
// router.get('/dumpExcelToMongo', (req, res) => {
//   dumpExcelDataToMongo().then(
//     () => {
//       res.send('Return Data Population Done');
//     },
//     () => {
//       res.status(500);
//     }
//   );
// });

// router.get('/retrieveCVC/:state/:district', (req, res) => {
//   const params = req.params;
//   getCVCInformation(params).then(
//     (result: unknown) => {
//       res.send(result);
//       res.status(200);
//     },
//     () => {
//       res.status(500);
//     }
//   );
// });

// router.get('/getStates', (req, res) => {
//   const params = req.body;
//   getStates(params).then(
//     (result: unknown) => {
//       res.send(result);
//       res.status(200);
//     },
//     () => {
//       res.status(500);
//     }
//   );
// });

// router.get('/getDistricts/:state', (req, res) => {
//   const params = req.params;
//   getDistrictNames(params).then(
//     (result: unknown) => {
//       res.send(result);
//       res.status(200);
//     },
//     () => {
//       res.status(500);
//     }
//   );
// });

router.get('/meta/states', async (req, res) => {
  const controller = new MetaController();
  const response = await controller.states();
  return res.send(response);
});

router.get('/meta/states/:state_id', async (req, res) => {
  const params = req.params;
  const controller = new MetaController();
  const response = await controller.districts(params.state_id);
  return res.send(response);
});

router.post('/cvc', async (req, res) => {
  const controller = new CVCController();
  const body = req.body;
  const response = await controller.search(body);
  return res.send(response);
});

router.post('/volunteer/call_request', async (req, res) => {
  const controller = new VolunteerController();
  const body = req.body;
  const response = await controller.callRequest(body);
  return res.send(response);
});

router.post('/volunteer/report', async (req, res) => {
  const controller = new VolunteerController();
  const body = req.body;
  const response = await controller.report(body);
  return res.send(response);
});

router.post('/form/vaccination_experience', async (req, res) => {
  const controller = new FormController();
  const body = req.body;
  const response = await controller.callRequest(body);
  return res.send(response);
});

export default router;
