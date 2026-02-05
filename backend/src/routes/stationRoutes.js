const express = require('express');
const router = express.Router();
const stationController = require('../controllers/stationController');

router.get('/', stationController.getAllStations);
router.get('/:id', stationController.getStation);
router.post('/', stationController.createStation);
router.put('/:id', stationController.updateStation);
router.delete('/:id', stationController.deleteStation);
router.get('/:id/resources', stationController.getStationResources);
router.get('/:id/contracts', stationController.getStationContracts);
router.get('/:id/fleets', stationController.getStationFleets);

module.exports = router;
