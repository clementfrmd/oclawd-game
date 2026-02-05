const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');

router.get('/', contractController.getAllContracts);
router.get('/:id', contractController.getContract);
router.get('/station/:stationId', contractController.getContractsByStation);
router.post('/', contractController.createContract);
router.put('/:id', contractController.updateContract);
router.post('/:id/cancel', contractController.cancelContract);
router.post('/:id/accept', contractController.acceptContract);
router.post('/:id/complete', contractController.completeContract);

module.exports = router;
