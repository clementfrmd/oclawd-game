const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');

router.get('/', resourceController.getAllResources);
router.get('/:id', resourceController.getResource);
router.get('/station/:stationId', resourceController.getResourcesByStation);
router.get('/type/:type', resourceController.getResourcesByType);
router.post('/station/:stationId', resourceController.createResource);
router.put('/:id', resourceController.updateResource);
router.post('/transfer', resourceController.transferResource);

module.exports = router;
