const express = require('express');

const router = express.Router();

router.route('/create')
  .get((req, res) => {
    res.status(400).render('clubListPage', {
      layout: 'index',
      data: {
        clubInfo: {},
        message: { text: 'This feature is currently under development.' },
        title: 'Page unavailable.'
      }
    });
  });

module.exports = router;
