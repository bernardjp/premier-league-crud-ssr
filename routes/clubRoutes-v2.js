const express = require('express');
const controller = require('../controllers/clubListController');

const router = express.Router();

router.route('/').get(controller.getClubList).delete(controller.deleteClub);
router.route('/create').get(controller.getCreateClubPage).post(controller.createClub);
router.route('/:clubTLA').get(controller.getClub);
router.route('/:clubTLA/edit').get(controller.getUpdateClubPage).post(controller.updateClub);

module.exports = router;
