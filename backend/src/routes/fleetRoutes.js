const express = require('express');
const router = express.Router();
const fleetController = require('../controllers/fleetController');

router.get('/', fleetController.getAllFleets);
router.get('/:id', fleetController.getFleet);
router.get('/station/:stationId', fleetController.getFleetsByStation);
router.post('/', fleetController.createFleet);
router.put('/:id', fleetController.updateFleet);
router.post('/:id/deploy', fleetController.deployFleet);
router.post('/:id/return', fleetController.returnFleet);
router.delete('/:id', fleetController.deleteFleet);
router.get('/stats', fleetController.getFleetStats);

module.exports = router;
