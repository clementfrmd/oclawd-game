const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/marketplaceController');

router.get('/', marketplaceController.getAllMarketplaces);
router.get('/type/:type', marketplaceController.getMarketplaceByType);
router.get('/data/:type', marketplaceController.getMarketData);
router.post('/buy/:stationId', marketplaceController.buyResource);
router.post('/sell/:stationId', marketplaceController.sellResource);
router.post('/update-prices', marketplaceController.updatePrices);

module.exports = router;
